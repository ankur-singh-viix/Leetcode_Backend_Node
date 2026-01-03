import { Job, Worker } from "bullmq";
import { SUBMISSION_QUEUE } from "../utils/constants";
import logger from "../config/logger.config";
import { createNewRedisConnection } from "../config/redis.config";
import { EvaluationJob, EvaluationResult, TestCase } from "../interfaces/evaluation.interface";
import { runCode } from "../utils/containers/codeRunner.util";
import { LANGUAGE_CONFIG } from "../config/language.config";
import { updateSubmission } from "../api/submission.api";

/* ---------- helpers ---------- */

function normalizeOutput(output: string): string {
    return output.replace(/\r\n/g, "\n").trim().split(/\s+/).join(" ");
}

function matchTestCasesWithResults(
    testCases: TestCase[],
    results: EvaluationResult[]
): Record<string, string> {

    const verdictMap: Record<string, string> = {};

    testCases.forEach((testCase, index) => {
        const result = results[index];

        if (result.status === "time_limit_exceeded") {
            verdictMap[testCase._id] = "TLE";
        } 
        
        else if (result.status === "failed") {
            verdictMap[testCase._id] = "Error";
        } 
        
        else {
            const actual = normalizeOutput(result.output || "");
            const expected = normalizeOutput(testCase.output);
            verdictMap[testCase._id] = actual === expected ? "AC" : "WA";
        }

    });

    return verdictMap;
}

function getFinalVerdict(verdictMap: Record<string, string>): string {
    const verdicts = Object.values(verdictMap);
    if (verdicts.includes("TLE")) return "TLE";
    if (verdicts.includes("Error")) return "Error";
    if (verdicts.includes("WA")) return "WA";
    return "AC";
}

/* ---------- worker ---------- */

async function setupEvaluationWorker() {
    new Worker(
        SUBMISSION_QUEUE,
        async (job: Job) => {
            logger.info(`Processing job ${job.id}`);
            const data: EvaluationJob = job.data;

            try {
                const testCasesRunnerResults: EvaluationResult[] =
                    (await Promise.all(
                        data.problem.testcases.map(testcase =>
                            runCode({
                                code: data.code,
                                language: data.language,
                                timeout: LANGUAGE_CONFIG[data.language].timeout,
                                imageName: LANGUAGE_CONFIG[data.language].imageName,
                                input: testcase.input
                            })
                        )
                    )).map(result => ({
                        status: result.status,
                        output: result.output || "",
                        
                    }));
                console.log("Testcase Runner Results: " , testCasesRunnerResults);

                const verdictMap = matchTestCasesWithResults(
                    data.problem.testcases,
                    testCasesRunnerResults
                );

                const testcaseResults = Object.values(verdictMap) as string[]; // ["AC", "WA"]
                const finalVerdict = getFinalVerdict(verdictMap);

                console.log("Per Testcase Verdicts:", testcaseResults);
                console.log("Final Verdict:", finalVerdict);

                logger.info(`Evaluation job ${job.id} completed. Final Verdict: ${finalVerdict}`);



                await updateSubmission(data.submissionId, "completed", {
                    verdict: finalVerdict,
                    testcases: testcaseResults.join(",")
                });

            } catch (error) {
                logger.error(`Evaluation job failed: ${job.id}`, error);
            }
        },
        {
            connection: createNewRedisConnection()
        }
    );

    // logger.info("Evaluation worker started");
}



export default setupEvaluationWorker;
