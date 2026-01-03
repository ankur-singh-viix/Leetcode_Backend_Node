import { CPP_IMAGE, PYTHON_IMAGE } from "../utils/constants";

export const LANGUAGE_CONFIG = {
    python: {
        timeout: 4000,
        imageName: PYTHON_IMAGE
    },
    cpp: {
        timeout: 1000,  // C++ programs are expected to run faster
        imageName: CPP_IMAGE
    }
}