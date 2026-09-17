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
    
};

export const addProblemToPlaylist = async(req, res) => {

};

export const deletePlaylist = async(req, res) => {

};

export const removeProblemFromPlaylist = async(req, res) => {

};