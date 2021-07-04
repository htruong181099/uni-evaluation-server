const {getValidationResult} = require("../../middleware/validate.middleware");
const upload = require("../../middleware/multer.middleware")
const {fileController} = require("../../controller/");

module.exports = (app) =>{

    //import user excel to DB
    app.post("/admin/user/file/import",
        upload.single('file'),
        fileController.readExcelUser,
        fileController.importUsers,
        fileController.deleteFile
    )

    // download file using query
    app.get("/admin/file/download",
        fileController.validate("download"),
        getValidationResult,
        fileController.getTemplate,
        fileController.download
    )

    //import evaluateCriteria && evaluateDescription to DB
    app.post("/admin/file/form/:fcode/evaluation/import",
        upload.single('file'),
        fileController.validate("importEvaluation"),
        getValidationResult,
        fileController.readExcelEvaluateCriteria,
        fileController.importEvaluations,
        fileController.deleteFile
    )

    //export evaluateCriteria template
    app.post("/admin/file/form/:fcode/evaluation/export",
        fileController.validate("exportEvaluation"),
        getValidationResult,
        fileController.createFile,
        fileController.downloadAndDelete
    )
}