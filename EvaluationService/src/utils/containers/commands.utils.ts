export const commands = {
    python: function(code: string) {
        const runCommand = `echo '${code}' > code.py && python3 code.py`;
        return ['/bin/bash', '-c', runCommand];
    },

    javascript: function(code: string) {
        const runCommand = `echo '${code}' > code.js && node code.js`;
        return ['/bin/bash', '-c', runCommand];
    },

    java: function(code: string) {
        const runCommand = `echo '${code}' > Main.java && javac Main.java && java Main`;
        return ['/bin/bash', '-c', runCommand];
    },
    
    cpp: function(code: string) {
        const runCommand = `echo '${code}' > code.cpp && g++ -o code code.cpp && ./code`;
        return ['/bin/bash', '-c', runCommand];
    },
};