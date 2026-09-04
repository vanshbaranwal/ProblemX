import { error } from "node:console";
import { db } from "../libs/db.js";
import { getJudge0LanguageId, pollBatchResults, submitBatch } from "../libs/judge0.lib.js";
import { objectEnumValues } from "../generated/prisma/runtime/library.js";
import { stdin } from "node:process";



export const createProblem = async(req, res) => {
    
    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippet, referenceSolutions } = req.body;
    
    // using middleware checkadmin in routes
    // if(req.user.role !== "ADMIN"){
    //     return res.status(403).json({
    //         error: "you are not allowed to create a problem",
    //     });
    // };

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
    try {
        const problems = await db.problem.findMany();
        
        if(!problems){
            return res.status(404).json({
                error: "no problems found"
            });
        }

        res.status(200).json({
            success: true,
            message: "message is fetched successfully",
            problems
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while fetching problems"
        });
    }
};

export const getProblemById = async(req, res) => {
    const { id } = req.params;

    try {
        const problem = await db.problem.findUnique({ where: { id } });

        if(!problem){
            return res.status(404).json({
                error: "problem not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "problem fetched successfully",
            problem
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while fetching problem by id"
        });
    }
};

export const updateProblem = async(req, res) => {
    // id
    // id--->problem ( condition)
    // rest same as create
    const { id } = req.params;

    const { title, description, difficulty, tags, examples, constraints, testcases, codeSnippet, referenceSolutions } = req.body;

    try {
        const existingProblem = await db.problem.findUnique({ where: { id } });

        if(!existingProblem){
            return res.status(404).json({
                error: "problem not found"
            });
        }

        if(!referenceSolutions || typeof referenceSolutions !== "object" || Object.keys(referenceSolutions).length === 0){
            return res.status(400).json({
                error: "reference solutions are required"
            });
        }

        if(!Array.isArray(testcases) || testcases.length === 0){
            return res.status(400).json({
                error: "atleast one testcase is required"
            });
        }

        for(const [language, solutionCode] of Object.entries(referenceSolutions)){
            const languageId = getJudge0LanguageId(language);

            if(!languageId){
                return res.status(400).json({
                    error: `language ${language} is not supported`
                });
            }

            const submissions = testcases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }));

            const submissionResults = await submitBatch(submissions);

            const tokens = submissionResults.map((res) => res.token);

            const results = await pollBatchResults(tokens);

            for(let i = 0; i < results.length; i++){
                const result = results[i];
                console.log("result --------", result);

                if(!result.status || result.status.id !== 3){
                    return res.status(400).json({
                        error: `testcase ${i+1} failed for language ${language}` 
                    });
                }
            }
        }

        const updatedProblem = await db.problem.update({
            where: { id },
            data: {
                title,
                description,
                difficulty,
                tags,
                examples,
                constraints,
                testcases,
                codeSnippet,
                referenceSolutions
            },
        });

        return res.status(200).json({
            success: true,
            message: "problem updated successfully",
            problem: updatedProblem
        });

    } catch (error) {
        console.error(`error updating problem: ${error}`);

        return res.status(500).json({
            error: "error while updating problem"
        });
    }

};

export const deleteProblem = async(req, res) => {
    const { id } = req.params;

    // using middleware checkadmin in routes
    // if(req.user.role !== "ADMIN"){
    //     return res.status(403).json({
    //         error: "you are not allowed to create a problem",
    //     });
    // };

    try {
        const problem = await db.problem.findUnique({ where: { id } });
    
        if(!problem){
            return res.status(404).json({
                error: "problem not found"
            });
        }
    
        await db.problem.delete({ where: { id } });

        return res.status(200).json({
            success: true,
            message: "problem deleted successfully"
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: "error while deleting problem"
        });
    }
};

export const getAllProblemsSolvedByUser = async(req, res) => {

};