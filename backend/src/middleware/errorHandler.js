export function errorHandler(error, req, res, next) {
  console.error(error.message);
  res
    .status(error.status || 500)
    .json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
}
