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
        standardController.validate('getStandardbyID'),
        getValidationResult,
        standardController.getStandardbyID
    )
    app.get("/admin/standard/:scode/get",
        standardController.validate('getStandard'),
        getValidationResult,
        standardController.getStandard
    )

    //edit standard by id
    app.post("/admin/standard/:id/editbyID",
        standardController.validate('editStandardbyID'),
        getValidationResult,
        standardController.editStandardbyID
    )
    //edit standard
    app.post("/admin/standard/:scode/edit",
        standardController.validate('editStandard'),
        getValidationResult,
        standardController.editStandard
    )
    //delete DB
    app.post("/admin/standard/:id/deleteDB",
        standardController.validate('deleteStandardDB'),
        getValidationResult,
        standardController.deleteStandardDB
    )
    //set isDeleted - true
    app.post("/admin/standard/:scode/delete",
        standardController.validate('deleteStandard'),
        getValidationResult,
        standardController.deleteStandard
    )
    //set isDeleted - true
    app.post("/admin/standard/:scode/restore",
        standardController.validate('restoreStandard'),
        getValidationResult,
        standardController.restoreStandard
    )
    //add standard
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