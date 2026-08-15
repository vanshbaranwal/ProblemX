import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";



export const createProblem = async(req, res) => {
    
    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippet, referenceSolutions } = req.body;
    
    if(req.user.role !== "ADMIN"){
        return res.status(403).json({
            error: "you are not allowed to create a problem",
        });
    };

    try {
        for(const [language, solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    error: `language ${language} is not supported`,
                });
            };

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output,
            }));
  
            const submissionResults = await submitBatch(submissions);
            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for(let i = 0; i < results.length; i++){
                const result = results[i];
                console.log("result --------", result);
                // console.log(`testcase ${ i + 1 } and language ${ language } ------- result ${ JSON.stringify(result.status.description) }`);

                if(!result.status || result.status.id !== 3){
                    return res.status(400).json({
                        error: `testcase ${i+1} failed for language ${language}`
                    });
                }
            }

        }
        
        const newProblem = await db.problem.create({
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippet,
                referenceSolutions,
                userId: req.user.id,
            },
        });

        return res.status(201).json({
            success: true,
            message: "problem created successfully",
            problem: newProblem,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while creating problem",
        });
    }

};

export const getAllProblems = async(req, res) => {

};

export const getProblemById = async(req, res) => {

};

export const updateProblem = async(req, res) => {

};

export const deleteProblem = async(req, res) => {

};

export const getAllProblemsSolvedByUser = async(req, res) => {

};