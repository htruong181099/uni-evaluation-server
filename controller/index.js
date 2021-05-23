const controller = {};

controller.adminController = require("./admin.controller");
controller.authController = require("./auth.controller");
controller.criteriaController = require("./criteria.controller");
controller.criteriaOptionController = require("./criteriaOption.controller");
controller.departmentController = require("./department.controller");
controller.evaluationReviewController = require("./evaluationReview.controller");
controller.formController = require("./form.controller");
controller.formCriteriaController = require("./formCriteria.controller");
controller.formStandardController = require("./formStandard.controller");
controller.formDepartmentController = require("./formDepartment.controller");
controller.formTypeController = require("./formType.controller");
controller.formUserController = require("./formUser.controller");
controller.standardController = require("./standard.controller");
controller.userController = require("./user.controller");
controller.userFormController = require("./userForm.controller");
controller.evaluationController = require("./evaluation.controller");

module.exports = controller;