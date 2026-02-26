(function(angular, $, _) {
  angular.module('afsearchTabDiscounts', CRM.angRequires('afsearchTabDiscounts'));
  angular.module('afsearchTabDiscounts').directive('afsearchTabDiscounts', function(afCoreDirective) {
    return afCoreDirective("afsearchTabDiscounts", {"title":"Codes Redeemed","name":"afsearchTabDiscounts","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabDiscounts\/afsearchTabDiscounts.aff.html"
    });
  });
})(angular, CRM.$, CRM._);

