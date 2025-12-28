const bashConfig = ['/bin/bash', '-c'];

export const commands = {
    python: function(code: string, input: string) {
        const runCommand = `echo '${code}' > code.py && echo '${input}' > input.txt && python3 code.py < input.txt`;
        return [...bashConfig, runCommand];
    },

    javascript: function(code: string) {
        const runCommand = `echo '${code}' > code.js && node code.js`;
        return [...bashConfig, runCommand];
    },

    java: function(code: string) {
        const runCommand = `echo '${code}' > Main.java && javac Main.java && java Main`;
        return [...bashConfig, runCommand];
    },

    cpp: function(code: string, input: string) {
        const runCommand = `mkdir app && cd app && echo '${code}' > code.cpp && g++ -o code code.cpp && echo '${input}' > input.txt && ./code < input.txt`;
        return [...bashConfig, runCommand];
    },  


};