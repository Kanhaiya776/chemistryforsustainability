(function(angular, $, _) {
  angular.module('afsearchTabRel', CRM.angRequires('afsearchTabRel'));
  angular.module('afsearchTabRel').directive('afsearchTabRel', function(afCoreDirective) {
    return afCoreDirective("afsearchTabRel", {"title":"Relationships","name":"afsearchTabRel","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabRel\/afsearchTabRel.aff.html"
    });
  });
})(angular, CRM.$, CRM._);

