const {standardController, criteriaController} = require("../../controller")
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) => {
    //standard
    app.get("/admin/standard/",
        standardController.getStandards
    )
    app.get("/admin/standard/criteria",
        standardController.getStandardsWithCriteria
    )
    app.get("/admin/standard/:id",
        standardController.validate('getStandard'),
        getValidationResult,
        standardController.getStandard
    )
    app.post("/admin/standard/:id/delete",
        standardController.validate('deleteStandard'),
        getValidationResult,
        standardController.deleteStandard
    )
    app.post("/admin/standard/add",
        standardController.validate('addStandard'),
        getValidationResult,
        standardController.addStandard
    )
    app.post("/admin/standard/:id/criteria/add",
        criteriaController.addCriteria
    )
    app.get("/admin/standard/:id/criteria",
        criteriaController.validate('getCriterions'),
        getValidationResult,
        criteriaController.getCriterions
    )
}