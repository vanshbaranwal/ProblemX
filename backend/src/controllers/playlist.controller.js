import { db } from "../libs/db.js";


export const createPlaylist = async(req, res) => {
    try {
        const { name, description } = req.body;

        const userId = req.user.id;

        if(typeof name !== "string" || !name.trim()){
            return res.status(400).json({
                success: false,
                message: "playlist name is required"
            });
        }

        if(description !== undefined && typeof description !== "string"){
            return res.status(400).json({
                success: false,
                message: "playlist description must be a string"
            });
        }

        const playlist = await db.playlist.create({
            data: {
                name: name.trim(),
                description: description?.trim(),
                userId
            }
        });

        return res.status(201).json({
            success: true,
            message: "playlist created successfully",
            playlist
        });

    } catch (error) {
        console.error("error creating the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to create the playlist"
        });
    }
};

export const getAllListDetails = async(req, res) => {
    try {
        const playlists = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "playlist fetched successfully",
            playlists
        });

    } catch (error) {
        console.error("error fetching the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to fetch the playlist"
        });
    }
};

export const getPlaylistDetails = async(req, res) => {
    const { playlistId } = req.params;

    try {
        const playlist = await db.playlist.findUnique({
            where: {
                id: playlistId,
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        });

        if(!playlist){
            return res.status(404).json({
                success: false,
                error: "playlist not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "playlist fetched successfully",
            playlist
        });

    } catch (error) {
        console.error("error fetching the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to fetch the playlist"
        });
    }
};

export const addProblemToPlaylist = async(req, res) => {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    try {
        
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({
                success: false,
                error: "invalid or missing problemsId"
            });
        }

        // creating records for the each problems in the playlist
        
        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => {
                playlistId,
                problemId
            })
        });

        return res.status(201).json({
            success: true,
            message: "problems added to playlist successfully",
            problemsInPlaylist
        });

    } catch (error) {
        console.error("error adding a problem in the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to add problem in playlist"
        });
    }
};

export const deletePlaylist = async(req, res) => {
    const { playlistId } = req.params;
    
    try {
        const deletedPlaylist = await db.playlist.delete({
            where: {
                id: playlistId
            }
        });

        return res.status(200).json({
            success: true,
            message: "playlist deleted successfully",
            deletedPlaylist
        });

    } catch (error) {
        console.error("error deleting the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to delete the playlist"
        });
    }
};

export const removeProblemFromPlaylist = async(req, res) => {
    const { playlistId } = req.params;
    const { problemIds } = req.body;

    try {
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({
                success: false,
                error: "invalid or missing problemId"
            });
        }

        const deletedProblem = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId,
                problemId: {
                    in: problemIds
                }
            }
        });

        return res.status(200).json({
            success: true,
            message: "problem removed from playlist successfully",
            deletedProblem
        });

    } catch (error) {
        console.error("error removing the problem from the playlist: ", error);

        return res.status(500).json({
            success: false,
            error: "failed to remove problem fromm the playlist"
        });
    }
};