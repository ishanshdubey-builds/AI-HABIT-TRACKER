export const notFound = (req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export const errorHandler = (err, req, res, next) => {
    console.error(err);

    const status =
        res.statusCode && res.statusCode !== 200
            ? res.statusCode
            : 500;

    res.status(status).json({
        message: err.message || "Server error",
    });
};

// export const notFound = (req, res, next) => {
//     res.status(400).json({ message: `Route not found: ${req.originalUrl}`});
// };

// export const errorHandler = (errorHandler, req, res, next) => {
//     console.error(err);
//     const status = 
//     res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
//     res.status(status).json({
//         message: err.message || "Server error",
//     });
// };