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

    //add standard
    app.post("/admin/standard/add",
        standardController.validate('addStandard'),
        getValidationResult,
        standardController.addStandard
    )

    //get deleted standards
    app.get("/admin/standard/deleted",
        standardController.getDeletedStandards
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
    app.post("/admin/standard/:id/deletebyID",
        standardController.validate('deleteStandardbyID'),
        getValidationResult,
        standardController.deleteStandardbyID
    )
    //set isDeleted - true
    app.post("/admin/standard/:scode/restore",
        standardController.validate('restoreStandard'),
        getValidationResult,
        standardController.restoreStandard
    )
    

    ////standard's criterions
    //create new criteria of a standard
    app.post("/admin/standard/:id/criteria/add",
        criteriaController.validate('addCriteria'),
        getValidationResult,
        criteriaController.addCriteria
    )
    //get criterions of a standard
    app.get("/admin/standard/:id/criteria",
        criteriaController.validate('getCriterions'),
        getValidationResult,
        criteriaController.getCriterions
    )
    app.get("/admin/standard/:scode/criteria/get",
        criteriaController.validate('getCriterionsbyCode'),
        getValidationResult,
        criteriaController.getCriterionsbyCode
    )
    //get deleted criterions of a standard
    app.get("/admin/standard/:id/criteria/deleted",
        criteriaController.validate('getDeletedCriterions'),
        getValidationResult,
        criteriaController.getDeletedCriterions
    )
}