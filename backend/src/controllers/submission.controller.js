import { db } from "../libs/db.js";




export const getAllSubmission = async(req, res) => {
    try {
        const userId = req.user.id;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId
            }
        });

        return res.status(200).json({
            success: true,
            message: "submissions fetched successfully",
            submissions
        });

    } catch (error) {
        console.error("fetch submission error : ", error);
        return res.status(500).json({
            error: "failed to fetch submissions"
        });
    }
};

export const getSubmissionsForProblem = async(req, res) => {
    try {
        const userId = req.user.id;
        const problemId = req.params.problemId;

        const submissions = await db.submission.findMany({
            where: {
                userId: userId,
                problemId: problemId
            }
        });

        return res.status(200).json({
            success: true,
            message: "submission fetched successfully",
            submissions
        });

    } catch (error) {
        console.error("failed to fetch user submission : ", error);
        return res.status(500).json({
            success: false,
            error: "failed to fetch your submissions for this problem" 
        });
    }
};

export const getAllTheSubmissionsForProblem = async(req, res) => {
    try {
        const problemId = req.params.problemId;
        
        const submission = await db.submission.count({
            where: {
                problemId: problemId
            }
        });

        return res.status(200).json({
            success: true,
            message: "submissions fetched successfully",
            count: submission
        });

    } catch (error) {
        console.error("failed to count problem submissions", error);
        return res.status(500).json({
            success: false,
            error: "failed to count submissions for this problem"
        });
    }
};