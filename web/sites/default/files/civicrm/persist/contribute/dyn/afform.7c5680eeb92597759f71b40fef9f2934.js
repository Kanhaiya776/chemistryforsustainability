(function(angular, $, _) {
  angular.module('afsearchTabGrant', CRM.angRequires('afsearchTabGrant'));
  angular.module('afsearchTabGrant').directive('afsearchTabGrant', function(afCoreDirective) {
    return afCoreDirective("afsearchTabGrant", {"title":"Grants","name":"afsearchTabGrant","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabGrant\/afsearchTabGrant.aff.html"
    });
  });
})(angular, CRM.$, CRM._);

