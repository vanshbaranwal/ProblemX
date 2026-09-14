import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";



export const executeCode = async(req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;

        const userId = req.user.id;

        // validate testcases (the output that is coming is in the form of array or not)
        if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length
        ){
            return res.status(400).json({
                error: "invalid or missing testcases"
            });
        }


        // prepare each testcase for judge0 batch submission
        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input
        }));

        // send batch of submissions to judge0
        const submitResponse = await submitBatch(submissions);

        const tokens = submitResponse.map((res) => res.token);

        // poll judge0 for results of all submitted testcases
        const results = await pollBatchResults(tokens);

        console.log(`result-----------------`);
        console.log(results);

        res.status(200).json({
            message: "code executed!"
        });
    } catch (error) {
        console.error("error while executing the code: ", error);
        
        return res.status(500).json({
            success: false,
            error: "error while executing the code",
            message: error.message
        });
    }
};