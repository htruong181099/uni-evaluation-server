const {criteriaController, criteriaOptionController} = require("../../controller/");
const {getValidationResult} = require("../../middleware/validate.middleware");

module.exports = (app) => {

    //criteria
    app.get("/admin/criteria",
        criteriaController.getAllCriterions
    )
    app.get("/admin/criteria/:id/",
        criteriaController.validate('getCriteria'),
        getValidationResult,
        criteriaController.getCriteria
    )
    app.post("/admin/criteria/:id/deleteDB",
        criteriaController.validate('deleteCriteriaDB'),
        getValidationResult,
        criteriaController.deleteCriteriaDB
    )
    //edit
    app.post("/admin/criteria/:ccode/edit",
        criteriaController.validate('editCriteria'),
        getValidationResult,
        criteriaController.editCriteria
    )
    //set isDeleted - true
    app.post("/admin/criteria/:ccode/delete",
        criteriaController.validate('deleteCriteria'),
        getValidationResult,
        criteriaController.deleteCriteria
    )
    //set isDeleted - false
    app.post("/admin/criteria/:ccode/restore",
        criteriaController.validate('restoreCriteria'),
        getValidationResult,
        criteriaController.restoreCriteria
    )

    //criteria option
    app.get("/admin/criteria/:ccode/option",
        criteriaOptionController.validate('getCriteriaOption'),
        getValidationResult,
        criteriaOptionController.getCriteriaOption
    )
    
    app.post("/admin/criteria/:ccode/addCriteriaOption",
        criteriaOptionController.validate('addCriteriaOption'),
        getValidationResult,
        criteriaOptionController.addCriteriaOption
    )
}