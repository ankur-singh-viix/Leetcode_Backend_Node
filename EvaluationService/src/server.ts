import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.routers';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './Middlewares/error-middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './Middlewares/correlation.middleware';
// import { connectDB } from './config/db.config';
import { startworkers } from './workers/evaluation.worker';

// import { connect } from 'http2';
// import { pullImage } from './utils/containers/pullimage.util';
import { pullAllImages } from './utils/containers/pullimage.util';
// import { createNewDockerContainer } from './utils/containers/createContainer.util';
// import { PYTHON_IMAGE } from './utils/constants';
import { runCode } from './utils/containers/codeRunner.util';

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

    // await connectDB();
//    await startworkers();
//    logger.info('Workers started successfully');
   

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
    await testPyThonCode();
});


async function testPyThonCode(){
    const pythonCode = `

import time
i=0
while True:
    i+=1
    print(i)
    time.sleep(1)

print("Hello, World!")
    `;

    // Create a container with the Python code

    await runCode({
        code: pythonCode,
        language: 'python',
        timeLimit: 3000, // 3 seconds
        memoryLimit: 512 * 1024 * 1024, // 512 MB
      
    });


    
}
