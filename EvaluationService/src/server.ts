import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.routers';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './Middlewares/error-middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './Middlewares/correlation.middleware';
import { connectDB } from './config/db.config';
import startWorker from './workers/evaluation.worker';


// import { connect } from 'http2';
// import { pullImage } from './utils/containers/pullimage.util';
import { pullAllImages } from './utils/containers/pullimage.util';
// import { createNewDockerContainer } from './utils/containers/createContainer.util';
// import { PYTHON_IMAGE } from './utils/constants';
import { runCode } from './utils/containers/codeRunner.util';
import { CPP_IMAGE, PYTHON_IMAGE } from './utils/constants';

const app = express();

app.use(express.json());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, async() => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    await connectDB();
   await startWorker();
   logger.info('Workers started successfully');
   

//    await pullImage("python:3.9");
//     console.log("Python image pulled successfully");

    await pullAllImages(); 
    console.log("All images pulled successfully");

    // const container =  await createNewDockerContainer({
    //     imageName: PYTHON_IMAGE,
    //     cmdExecutable: ['echo' , 'Hello, World!'],
    //     memoryLimit: 1024 * 1024 * 1024, // 1 GB
    //     });

    //     await container?.start();
    // console.log("Docker container created successfully");
    // await testPyThonCode();

    // await testCppCode();
});


// async function testPyThonCode(){
//     const pythonCode = `

// import time
// n = int(input())
// for i in range(n):
//     print(i+1)
// time.sleep(1)

// print("Hello, World!")
//     `;

//     // Create a container with the Python code

//     await runCode({
//         code: pythonCode,
//         language: 'python',
//         timeLimit: 3000, // 3 seconds
//         memoryLimit: 512 * 1024 * 1024, // 512 MB
//         imageName: PYTHON_IMAGE,
//         input: '8',
      
//     });
// }

// async function testCppCode(){
//     const cppCode = `
// #include <iostream>
// using namespace std;

// int main() {
// int n;
// std::cin >> n;
//     for(int i=0; i< n; i++){
//         cout << i+1 << endl;
//     }
//     cout << "Hello, World!!!" <<" " << n << endl;
//     return 0;
// }
//     `;  
//     await runCode({
//         code: cppCode,
//         language: 'cpp',
//         timeLimit: 3000, // 3 seconds
//         memoryLimit: 512 * 1024 * 1024, // 512 MB
//         imageName: CPP_IMAGE,

//     });
// }