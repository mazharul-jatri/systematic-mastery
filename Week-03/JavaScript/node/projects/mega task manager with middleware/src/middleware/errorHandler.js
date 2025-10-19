export const errorHandler = (err, req, res, next) => {
    console.log(`Error: ${err.message}`)

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    })
}

export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
}