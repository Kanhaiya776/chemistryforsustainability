(function(angular, $, _) {
  angular.module('ng')
    .config(['$locationProvider', function($locationProvider) {
      $locationProvider.hashPrefix('');
    }]);


angular.module('af', CRM.angRequires('af'));

  angular.module('af').directive('afButton', function() {
    return {
      restrict: 'C',
      bindToController: {
        type: '@'
      },
      require: {
        afForm: '?^^afForm',
      },
      controller: function($scope, $element) {
        const ctrl = this;

        this.$onInit = function () {
          const type = $element.attr('type');
          if (type === 'reset') {
            $element.on('click', function(e) {
              e.preventDefault();
              $scope.$apply(function() {
                if (ctrl.afForm) {
                  ctrl.afForm.resetForm();
                }
                else {
                  $scope.$parent.$broadcast('afFormReset');
                }
              });
            });
          }
        };
      }
    };
  });

  angular.module('af').component('afCharacterCount', {
    bindings: {
      maxlength: '<',
      getter: '<',
    },
    templateUrl: '~/af/afCharacterCount.html',
    controller: function($scope, $element) {
      this.$onInit = function() {
      };

      this.getLength = function() {
        return (this.getter() || '').length;
      };

      this.getStatusClass = function() {
        let fraction = this.getLength() / (this.maxlength || 1);
        if (fraction > 0.9) {
          return 'text-danger';
        }
        if (fraction > 0.7) {
          return 'text-warning';
        }
        return 'text-success';
      };

    }
  });

var modelProps = {
    type: '@',
    data: '=',
    actions: '=',
    modelName: '@name',
    label: '@'
  };
  angular.module('af').component('afEntity', {
    require: {afForm: '^afForm'},
    bindings: modelProps,
    controller: function() {

      this.$onInit = function() {
        var entity = _.pick(this, _.keys(modelProps));
        entity.actions = entity.actions || {update: true, create: true};
        entity.id = null;
        this.afForm.registerEntity(entity);
      };
    }

  });

var id = 0;
  angular.module('af').component('afField', {
    require: {
      afFieldset: '^^afFieldset',
      afJoin: '?^^afJoin',
      afRepeatItem: '?^^afRepeatItem'
    },
    templateUrl: '~/af/afField.html',
    bindings: {
      fieldName: '@name',
      defn: '='
    },
    controller: function($scope, $element, crmApi4, $timeout) {
      var ts = $scope.ts = CRM.ts('org.civicrm.afform'),
        ctrl = this,
        namePrefix = '',
        fieldOptions = null;
      this.inputAttrs = [];

      this.$onInit = function() {
        var closestController = $($element).closest('[af-fieldset],[af-join],[af-repeat-item]');
        $scope.dataProvider = closestController.is('[af-repeat-item]') ? ctrl.afRepeatItem : ctrl.afJoin || ctrl.afFieldset;
        $scope.fieldId = _.kebabCase(ctrl.fieldName) + '-' + id++;

        $element.addClass('af-field-type-' + _.kebabCase(ctrl.defn.input_type));

        if (this.defn.input_attrs && this.defn.input_attrs.multiple) {
          $element.addClass('af-field-type-multiple');
        }

        this.fkEntity = this.defn.fk_entity || null;

        if (this.defn.name !== this.fieldName) {
          if (!this.defn.name) {
            console.error('Missing field definition for: ' + this.fieldName);
            return;
          }
          namePrefix = this.fieldName.substr(0, this.fieldName.length - this.defn.name.length);
        }

        if (this.defn.search_operator) {
          this.search_operator = this.defn.search_operator;
        }

        fieldOptions = this.defn.options || null;
        if (this.defn.data_type === 'Boolean') {
          if (fieldOptions) {
            fieldOptions.forEach((option) => option.id = !!option.id);
          } else {
            fieldOptions = [{id: true, label: ts('Yes')}, {id: false, label: ts('No')}];
          }
        }
        if (ctrl.fieldName === 'is_primary' && 'repeatIndex' in $scope.dataProvider) {
          fieldOptions = [{id: true, label: ''}];
          $scope.$watch('dataProvider.afRepeat.getEntityController().getData()', function (items, prev) {
            var index = $scope.dataProvider.repeatIndex;
            if (items && !index && !_.find(items, 'is_primary')) {
              $scope.dataProvider.getFieldData().is_primary = true;
            }
            if (items && prev && items.length === prev.length && items[index].is_primary && prev[index].is_primary &&
              _.filter(items, 'is_primary').length > 1
            ) {
              $scope.dataProvider.getFieldData().is_primary = false;
            }
          }, true);
        }
        if (ctrl.defn.input_type === 'ChainSelect' && ctrl.defn.input_attrs.control_field) {
          const controlField = namePrefix + ctrl.defn.input_attrs.control_field;
          $scope.$watch('dataProvider.getFieldData()["' + controlField + '"]', function(val) {
            function validateValue() {
              var options = $scope.getOptions(),
                value = $scope.dataProvider.getFieldData()[ctrl.fieldName];
              if (_.isArray(value)) {
                _.remove(value, function(item) {
                  return !_.find(options, (option) => option.id == item);
                });
              } else {
                if (value && !_.find(options, (option) => option.id == value)) {
                  value = '';
                }
                $('input[crm-ui-select]', $element).val(value).change();
              }
            }
            if (val && (typeof val === 'number' || val.length)) {
              $('input[crm-ui-select]', $element).addClass('loading').prop('disabled', true);
              var params = {
                name: ctrl.afFieldset.getFormName(),
                modelName: ctrl.afFieldset.getName(),
                fieldName: ctrl.fieldName,
                joinEntity: ctrl.afJoin ? ctrl.afJoin.entity : null,
                values: $scope.dataProvider.getFieldData()
              };
              crmApi4('Afform', 'getOptions', params)
                .then(function(data) {
                  $('input[crm-ui-select]', $element).removeClass('loading').prop('disabled', !data.length);
                  fieldOptions = data;
                  validateValue();
                });
            } else {
              fieldOptions = null;
              validateValue();
            }
          }, true);
        }
        if (ctrl.defn.input_type === 'EntityRef' && ctrl.defn.dfk_entities && ctrl.defn.input_attrs.control_field) {
          const controlField = namePrefix + ctrl.defn.input_attrs.control_field;
          $scope.$watch('dataProvider.getFieldData()["' + controlField + '"]', function(val) {
            if (val && val.length) {
              if (Array.isArray(val)) {
                ctrl.fkEntity = ctrl.defn.dfk_entities[val[0]];
              } else {
                ctrl.fkEntity = ctrl.defn.dfk_entities[val];
              }
            } else {
              ctrl.fkEntity = null;
            }
          });
        }
        $timeout(function() {
          initializeValue(true);
        });

        function initializeValue(firstLoad) {
          var entityName = ctrl.afFieldset.getName(),
            joinEntity = ctrl.afJoin ? ctrl.afJoin.entity : null,
            uniquePrefix = '',
            urlArgs = $scope.$parent.routeParams;
          if (entityName) {
            var index = ctrl.getEntityIndex();
            uniquePrefix = entityName + (index ? index + 1 : '') + (joinEntity ? '.' + joinEntity : '') + '.';
          }
          if (urlArgs && ((uniquePrefix + ctrl.fieldName) in urlArgs)) {
            setValue(urlArgs[uniquePrefix + ctrl.fieldName]);
          }
          else if (urlArgs && (ctrl.fieldName in urlArgs)) {
            setValue(urlArgs[ctrl.fieldName]);
          }
          else if (firstLoad && ctrl.afFieldset.getStoredValue(ctrl.fieldName) !== undefined) {
            setValue(ctrl.afFieldset.getStoredValue(ctrl.fieldName));
          }
          else if ('afform_default' in ctrl.defn) {
            setValue(ctrl.defn.afform_default);
          }

          if (ctrl.defn.search_range) {
            var initialVal = $scope.dataProvider.getFieldData()[ctrl.fieldName];
            if (!_.isArray($scope.dataProvider.getFieldData()[ctrl.fieldName]) &&
              (ctrl.defn.input_type !== 'Select' || !ctrl.defn.is_date || initialVal === '{}')
            ) {
              $scope.dataProvider.getFieldData()[ctrl.fieldName] = {};
            }
            if (ctrl.defn.is_date) {
              ctrl.inputAttrs.push(ctrl.defn.input_attrs || {});
              for (var i = 1; i <= 2; ++i) {
                var attrs = _.cloneDeep(ctrl.defn.input_attrs || {});
                attrs.placeholder = attrs['placeholder' + i];
                attrs.timePlaceholder = attrs['timePlaceholder' + i];
                ctrl.inputAttrs.push(attrs);
              }
            }
          }
        }
        $scope.$on('afFormReset', function() {
          delete $scope.dataProvider.getFieldData()[ctrl.fieldName];
          initializeValue(false);
        });
      };
      $scope.$on('afIfDestroy', function() {
        if (ctrl.defn.input_type !== 'DisplayOnly') {
          delete $scope.dataProvider.getFieldData()[ctrl.fieldName];
        }
      });
      function correctValueType(value, dataType) {
        if (value === null) {
          return value;
        }
        if (Array.isArray(value)) {
          return value.map((val) => correctValueType(val, dataType));
        } else if (dataType === 'Integer' || dataType === 'Float') {
          return Number(value);
        } else if (dataType === 'Boolean') {
          return (value == 1);
        }
        return value;
      }

      this.isMultiple = function() {
        return (
          (['Select', 'EntityRef', 'ChainSelect'].includes(ctrl.defn.input_type) && ctrl.defn.input_attrs.multiple) ||
          (ctrl.defn.input_type === 'CheckBox' && ctrl.defn.data_type !== 'Boolean')
        );
      };
      function setValue(value) {
        if (typeof value === 'string' && ctrl.isMultiple()) {
          value = value.split(',');
        }
        if (ctrl.defn.input_type !== 'DisplayOnly') {
          value = correctValueType(value, ctrl.defn.data_type);
        }

        if (ctrl.defn.input_type === 'Date' && typeof value === 'string' && value.startsWith('now')) {
          value = getRelativeDate(value, ctrl.defn.input_attrs.time);
        }
        if (ctrl.defn.input_type === 'Number' && ctrl.defn.search_range) {
          if (!_.isPlainObject(value)) {
            value = {
              '>=': +(('' + value).split('-')[0] || 0),
              '<=': +(('' + value).split('-')[1] || 0),
            };
          }
        } else if (ctrl.defn.input_type === 'Number') {
          value = Number(value);
        }
        else if (ctrl.defn.search_range && !_.isPlainObject(value) &&
          !(ctrl.defn.options && _.findWhere(ctrl.defn.options, {id: value}))
        ) {
          value = {
            '>=': ('' + value).split('-')[0],
            '<=': ('' + value).split('-')[1] || '',
          };
        }
        $scope.getSetValue(value);
      }
      ctrl.getEntityIndex = function() {
        if ('repeatIndex' in $scope.dataProvider && $scope.dataProvider.afRepeat.getRepeatType() === 'join') {
          return $scope.dataProvider.outerRepeatItem ? $scope.dataProvider.outerRepeatItem.repeatIndex : 0;
        } else {
          return ctrl.afRepeatItem ? ctrl.afRepeatItem.repeatIndex : 0;
        }
      };

      ctrl.isReadonly = function() {
        if (ctrl.defn.input_attrs && ctrl.defn.input_attrs.autofill && !ctrl.afJoin) {
          return ctrl.afFieldset.getEntity().actions[ctrl.defn.input_attrs.autofill] === false;
        }
        return ctrl.defn.input_type === 'DisplayOnly';
      };

      ctrl.isDisabled = function() {
        if (ctrl.isReadonly()) {
          return true;
        }
        if (ctrl.defn.input_type === 'EntityRef' && !ctrl.fkEntity) {
          return true;
        }
        return false;
      };

      ctrl.getDisplayValue = function(value) {
        if (value === undefined || value === null || value === '') {
          return '';
        }
        if (fieldOptions) {
          let keys = Array.isArray(value) ? value : [value];
          let options = fieldOptions.filter((option) => keys.includes(option.id));
          return options.map((option) => option.label).join(', ');
        }
        if (ctrl.defn.data_type === 'Date' || ctrl.defn.data_type === 'Timestamp') {
          try {
            return CRM.formatDate(value, null, ctrl.defn.data_type === 'Timestamp');
          } catch (e) {
            return '';
          }
        }
        if (ctrl.defn.fk_entity) {
        }
        return value;
      };
      ctrl.onSelectEntity = function() {
        if (ctrl.defn.input_attrs && ctrl.defn.input_attrs.autofill) {
          const val = $scope.getSetSelect();
          const entity = ctrl.afFieldset.modelName;
          const entityIndex = ctrl.getEntityIndex();
          const joinEntity = ctrl.afJoin ? ctrl.afJoin.entity : null;
          const joinIndex = ctrl.afJoin && $scope.dataProvider.repeatIndex || 0;
          ctrl.afFieldset.afFormCtrl.loadData(entity, entityIndex, val, ctrl.defn.name, joinEntity, joinIndex);
        }
      };
      ctrl.getFileUploadParams = function() {
        return {
          modelName: ctrl.afFieldset.getName(),
          fieldName: ctrl.fieldName,
          joinEntity: ctrl.afJoin ? ctrl.afJoin.entity : null,
          entityIndex: ctrl.getEntityIndex(),
          joinIndex: ctrl.afJoin && $scope.dataProvider.repeatIndex || null
        };
      };

      ctrl.getAutocompleteParams = function() {
        let fieldName = ctrl.afFieldset.getName();
        if (ctrl.afJoin) {
          fieldName += '+' + ctrl.afJoin.entity;
        }
        fieldName += ':' + ctrl.fieldName;
        return {
          formName: 'afform:' + ctrl.afFieldset.getFormName(),
          fieldName: fieldName,
          values: $scope.dataProvider.getFieldData()
        };
      };

      $scope.getOptions = function () {
        return fieldOptions;
      };

      $scope.select2Options = function() {
        return {
          results: _.transform($scope.getOptions(), function(result, opt) {
            result.push({id: opt.id, text: opt.label});
          }, [])
        };
      };

      this.onChangeOperator = function() {
        $scope.dataProvider.getFieldData()[ctrl.fieldName] = {};
      };
      $scope.getSetValue = function(val) {
        var currentVal = $scope.dataProvider.getFieldData()[ctrl.fieldName];
        if (arguments.length) {
          if (ctrl.search_operator) {
            if (typeof currentVal !== 'object') {
              $scope.dataProvider.getFieldData()[ctrl.fieldName] = {};
            }
            return ($scope.dataProvider.getFieldData()[ctrl.fieldName][ctrl.search_operator] = val);
          }
          return ($scope.dataProvider.getFieldData()[ctrl.fieldName] = val);
        }
        if (ctrl.search_operator) {
          return (currentVal || {})[ctrl.search_operator];
        }
        return currentVal;
      };
      $scope.getSetSelect = function(val) {
        var currentVal = $scope.dataProvider.getFieldData()[ctrl.fieldName];
        if (arguments.length) {
          if (ctrl.defn.is_date) {
            if (val === '{}') {
              val = !_.isPlainObject(currentVal) ? {} : currentVal;
            }
          }
          else if (ctrl.defn.search_range) {
            return ($scope.dataProvider.getFieldData()[ctrl.fieldName]['>='] = val);
          }
          else if (ctrl.search_operator) {
            if (typeof currentVal !== 'object') {
              $scope.dataProvider.getFieldData()[ctrl.fieldName] = {};
            }
            return ($scope.dataProvider.getFieldData()[ctrl.fieldName][ctrl.search_operator] = val);
          }
          if (ctrl.defn.data_type === 'Boolean') {
            return ($scope.dataProvider.getFieldData()[ctrl.fieldName] = (val === 'true'));
          }
          if (ctrl.defn.data_type === 'Integer' || ctrl.defn.data_type === 'Float') {
            if (typeof val === 'string') {
              return ($scope.dataProvider.getFieldData()[ctrl.fieldName] = val.length ? Number(val) : null);
            } else if (Array.isArray(val)) {
              return ($scope.dataProvider.getFieldData()[ctrl.fieldName] = val.map(Number));
            }
          }
          return ($scope.dataProvider.getFieldData()[ctrl.fieldName] = val);
        }
        if (ctrl.defn.is_date) {
          return _.isPlainObject(currentVal) ? '{}' : currentVal;
        }
        else if (ctrl.defn.search_range) {
          return currentVal['>='];
        }
        else if (ctrl.search_operator) {
          return (currentVal || {})[ctrl.search_operator];
        }
        else if (!ctrl.isMultiple() && (typeof currentVal === 'boolean' || typeof currentVal === 'number')) {
          return JSON.stringify(currentVal);
        }
        return currentVal;
      };

      function getRelativeDate(dateString, includeTime) {
        const parts = dateString.split(' ');
        const baseDate = new Date();
        let unit = parts[2] || 'day';
        let offset = parseInt(parts[1] || '0', 10);

        switch (unit) {
          case 'week':
            offset *= 7;
            break;

          case 'year':
            offset *= 365;
        }
        let newDate = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
        let localYear = newDate.getFullYear();
        let localMonth = String(newDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        let localDay = String(newDate.getDate()).padStart(2, '0');
        let defaultDate = `${localYear}-${localMonth}-${localDay}`; // Format YYYY-MM-DD

        if (includeTime) {
          defaultDate += ' ' + newDate.toTimeString().slice(0,8);
        }
        return defaultDate;
      }

    }
  });

angular.module('af').directive('afFieldset', function() {
    return {
      restrict: 'A',
      require: ['afFieldset', '?^^afForm'],
      bindToController: {
        modelName: '@afFieldset',
        storeValues: '<'
      },
      link: function($scope, $el, $attr, ctrls) {
        var self = ctrls[0];
        self.afFormCtrl = ctrls[1];
      },
      controller: function($scope, $element) {
        let ctrl = this;
        let localData = [];
        let joinOffsets = {};
        let ts = $scope.ts = CRM.ts('org.civicrm.afform');

        this.getData = function() {
          return ctrl.afFormCtrl ? ctrl.afFormCtrl.getData(ctrl.modelName) : localData;
        };
        this.getName = function() {
          return this.modelName ||
            $element.find('[search-name][display-name]').attr('display-name');
        };
        this.getEntity = function() {
          return this.afFormCtrl.getEntity(this.modelName);
        };
        this.getEntityType = function() {
          return this.afFormCtrl.getEntity(this.modelName).type;
        };
        this.getFieldData = function() {
          var data = ctrl.getData();
          if (!data.length) {
            data.push({fields: {}});
          }
          return data[0].fields;
        };
        this.getFormName = function() {
          return ctrl.afFormCtrl ? ctrl.afFormCtrl.getFormMeta().name : $scope.meta.name;
        };

        this.getJoinOffset = function(joinEntity) {
          joinOffsets[joinEntity] = joinEntity in joinOffsets ? joinOffsets[joinEntity] + 1 : 0;
          return joinOffsets[joinEntity];
        };
        function getCacheKey() {
          return 'afform:' + ctrl.getFormName() + ctrl.getName();
        }
        this.getStoredValue = function(fieldName) {
          if (!this.storeValues) {
            return;
          }
          return CRM.cache.get(getCacheKey(), {})[fieldName];
        };
        this.$onInit = function() {
          if (this.storeValues) {
            $scope.$watch(ctrl.getFieldData, function(newVal, oldVal) {
              if (typeof newVal === 'object' && typeof oldVal === 'object' && Object.keys(newVal).length) {
                CRM.cache.set(getCacheKey(), newVal);
              }
            }, true);
          }
        };
      }
    };
  });

  angular.module('af').component('afForm', {
    bindings: {
      ctrl: '@'
    },
    require: {
      ngForm: 'form'
    },
    controller: function($scope, $element, $timeout, crmApi4, crmStatus, $window, $location, $parse, FileUploader) {
      var schema = {},
        data = {extra: {}},
        status,
        args,
        submissionResponse,
        autoSave = _.noop,
        saveDraftButtons = [],
        draftStatus = 'pristine',
        cancelDraftWatcher,
        uploadingDraftFiles = false,
        ts = CRM.ts('org.civicrm.afform'),
        ctrl = this;

      this.$onInit = function() {
        $scope.$parent[this.ctrl] = this;

        $timeout(function() {
          ctrl.loadData()
            .then(setupDraftWatcher);

          ctrl.showSubmitButton = displaySubmitButton(args);
        });
      };

      this.registerEntity = function registerEntity(entity) {
        schema[entity.modelName] = entity;
        data[entity.modelName] = [];
      };
      this.getEntity = function getEntity(name) {
        return schema[name];
      };
      this.getData = function getData(name) {
        return data[name];
      };
      this.getSchema = function getSchema(name) {
        return schema[name];
      };
      this.getFormMeta = function getFormMeta() {
        return $scope.$parent.meta;
      };
      this.resetForm = function() {
        this.ngForm.$setPristine();
        $scope.$parent.$broadcast('afFormReset');
        this.loadData();
      };
      this.loadData = function(selectedEntity, selectedIndex, selectedId, selectedField, joinEntity, joinIndex) {
        let toLoad = true;
        const params = {name: ctrl.getFormMeta().name, args: {}};
        if (selectedEntity) {
          toLoad = !!selectedId;
          params.args[selectedEntity] = {};
          params.args[selectedEntity][selectedIndex] = {};
          if (joinEntity) {
            params.fillMode = 'join';
            params.args[selectedEntity][selectedIndex].joins = {};
            params.args[selectedEntity][selectedIndex].joins[joinEntity] = {};
            params.args[selectedEntity][selectedIndex].joins[joinEntity][joinIndex] = {};
            params.args[selectedEntity][selectedIndex].joins[joinEntity][joinIndex][selectedField] = selectedId;
          } else {
            params.fillMode = 'entity';
            params.args[selectedEntity][selectedIndex][selectedField] = selectedId;
          }
        }
        else {
          params.fillMode = 'form';
          args = _.assign({}, $scope.$parent.routeParams || {}, $scope.$parent.options || {});
          _.each(schema, function (entity, entityName) {
            if (args[entityName] && typeof args[entityName] === 'string') {
              args[entityName] = args[entityName].split(',');
            }
          });
          params.args = args;
          ctrl.showSubmitButton = displaySubmitButton(args);
        }
        if (toLoad) {
          if (params.fillMode === 'form') {
            $element.block();
          }
          return crmApi4('Afform', 'prefill', params)
            .then((result) => {
              if (result.error_message) {
                disableForm(result.error_message);
                $element.unblock();
                return;
              }
              result.forEach((item) => {
                _.each(item.values, (values, index) => {
                  data[item.name][index] = data[item.name][index] || {};
                  data[item.name][index].joins = data[item.name][index].joins || {};
                  angular.merge(data[item.name][index], values, {fields: _.cloneDeep(schema[item.name].data || {})});
                });
              });
              $element.unblock();
            }, (error) => {
              disableForm(error.error_message);
              $element.unblock();
            });
        }
        else if (joinEntity) {
          data[selectedEntity][selectedIndex].joins[joinEntity][joinIndex] = {};
        }
        else if (selectedEntity) {
          Object.keys(data[selectedEntity][selectedIndex].fields).forEach(key => delete data[selectedEntity][selectedIndex].fields[key]);
          angular.merge(data[selectedEntity][selectedIndex].fields, _.cloneDeep(schema[selectedEntity].data || {}));
          data[selectedEntity][selectedIndex].joins = {};
        }
      };

      function displaySubmitButton(args) {
        if (args.sid && args.sid.length > 0) {
          return false;
        }
        return true;
      }
      var token = new URLSearchParams(window.location.search).get('_aff');
      var headers = {'X-Requested-With': 'XMLHttpRequest'};
      if (token) {
        headers['X-Civi-Auth-Afform'] = token;
      }
      this.fileUploader = new FileUploader({
        url: CRM.url('civicrm/ajax/api4/Afform/submitFile'),
        headers: headers,
        onAfterAddingFile: function(item) {
          setDraftStatus('unsaved');
        },
        onSuccessItem: onFileUploadSuccess,
        onCompleteAll: onFileUploadsComplete,
        onBeforeUploadItem: function(item) {
          status.resolve();
          status = CRM.status({start: ts('Uploading %1', {1: item.file.name})});
        }
      });

      function onFileUploadSuccess(item, response, status, headers) {
        if (response.values && response.values[0] && response.values[0].id) {
          var dataProvider = item.crmDataProvider;
          dataProvider.getFieldData()[item.crmFieldName] = response.values[0];
        }
      }

      function onFileUploadsComplete() {
        if (uploadingDraftFiles) {
          uploadingDraftFiles = false;
          setDraftStatus('saved');
          if (draftStatus === 'unsaved') {
            autoSave();
          }
          status.resolve();
        } else {
          postProcess();
        }
      }
      function setupDraftWatcher() {
        const buttons = getDraftButtons();
        const autoSaveEnabled = ctrl.getFormMeta().autosave_draft;

        if ((!autoSaveEnabled && !buttons.length) || !ctrl.showSubmitButton || !CRM.config.cid) {
          return;
        }
        $.each(buttons, function(index, button) {
          saveDraftButtons[index] = {
            text: $(button).text(),
            icon: $(button).attr('crm-icon'),
          };
        });
        if (autoSaveEnabled) {
          autoSave = _.debounce(ctrl.submitDraft, 10000);
        }

        cancelDraftWatcher = $scope.$watch(() => data, function (newVal, oldVal) {
            if (oldVal) {
              if (draftStatus === 'pristine') {
                setDraftStatus('saved');
              } else {
                setDraftStatus('unsaved');
                autoSave(newVal);
              }
            }
          },
          true
        );
      }
      this.checkConditions = function(conditions, op) {
        op = op || 'AND';
        var ret = op === 'AND',
          flip = !ret;
        _.each(conditions, function(clause) {
          if (_.isArray(clause[1])) {
            if (ctrl.checkConditions(clause[1], clause[0]) === flip) {
              ret = flip;
            }
          } else {
            if (_.isString(clause[0]) && clause[0].charAt(0) !== '"') {
              clause[0] = clause[0].replace(/\[([^'"])/g, "['$1").replace(/([^'"])]/g, "$1']");
            }
            let parser1 = $parse(clause[0]);
            let parser2 = $parse(clause[2]);
            let result = compareConditions(parser1(data), clause[1], parser2(data));
            if (result === flip) {
              ret = flip;
            }
          }
        });
        return op === 'NOT' ? !ret : ret;
      };

      function compareConditions(val1, op, val2) {
        const yes = (op !== '!=' && !op.includes('NOT '));

        switch (op) {
          case '=':
          case '!=':
          case '==':
            if (typeof val1 === 'string') {
              val1 = val1.toLowerCase();
            }
            if (typeof val2 === 'string') {
              val2 = val2.toLowerCase();
            }
            return angular.equals(val1, val2) === yes;

          case '>':
            return val1 > val2;

          case '<':
            return val1 < val2;

          case '>=':
            return val1 >= val2;

          case '<=':
            return val1 <= val2;

          case 'IS EMPTY':
            return !val1;

          case 'IS NOT EMPTY':
            return !!val1;

          case 'CONTAINS':
          case 'NOT CONTAINS':
            if (Array.isArray(val1)) {
              return val1.includes(val2) === yes;
            } else if (typeof val1 === 'string' && typeof val2 === 'string') {
              return val1.toLowerCase().includes(val2.toLowerCase()) === yes;
            }
            return angular.equals(val1, val2) === yes;

          case 'IN':
          case 'NOT IN':
            if (Array.isArray(val2)) {
              return val2.includes(val1) === yes;
            }
            return angular.equals(val1, val2) === yes;

          case 'LIKE':
          case 'NOT LIKE':
            if (typeof val1 === 'string' && typeof val2 === 'string') {
              return likeCompare(val1, val2) === yes;
            }
            return angular.equals(val1, val2) === yes;
        }
      }

      function likeCompare(str, pattern) {
        const regexPattern = pattern
          .replace(/([.+?^=!:${}()|\[\]\/\\])/g, "\\$1")
          .replace(/%/g, '.*') // Convert % to .*
          .replace(/_/g, '.'); // Convert _ to .
        const regex = new RegExp(`^${regexPattern}$`, 'i');
        return regex.test(str);
      }
      function postProcess() {
        var metaData = ctrl.getFormMeta(),
          dialog = $element.closest('.ui-dialog-content');

        $element.trigger('crmFormSuccess', {
          afform: metaData,
          data: data,
          submissionResponse: submissionResponse,
        });

        status.resolve();
        $element.unblock();

        if (dialog.length) {
          dialog.dialog('close');
        }

        else if (metaData.confirmation_type && metaData.confirmation_type === 'show_confirmation_message') {
          $element.hide();
          const $confirmation = $('<div class="afform-confirmation" />');
          $confirmation.text(metaData.confirmation_message);
          $confirmation.insertAfter($element);
        }

        else if ((!metaData.confirmation_type && metaData.redirect ) || (metaData.confirmation_type && metaData.confirmation_type === 'redirect_to_url' && metaData.redirect)) {
          var url = replaceTokens(metaData.redirect, submissionResponse[0]);
          if (url.indexOf('civicrm/') === 0) {
            url = CRM.url(url);
          } else if (url.indexOf('/') === 0) {
            let port = $location.port();
            port = port ? `:${port}` : '';
            url = `${$location.protocol()}://${$location.host()}${port}${url}`;
          }
          $window.location.href = url;
        }
      }

      function replaceTokens(str, vars) {
        function recurse(stack, values) {
          _.each(values, function(value, key) {
            if (_.isArray(value) || _.isPlainObject(value)) {
              recurse(stack.concat([key]), value);
            } else {
              var token = (stack.length ? stack.join('.') + '.' : '') + key;
              str = str.replace(new RegExp(_.escapeRegExp('[' + token + ']'), 'g'), value);
            }
          });
        }
        recurse([], vars);
        return str;
      }

      function validateFileFields() {
        var valid = true;
        $("af-form[ng-form=" + ctrl.getFormMeta().name +"] input[type='file']").each((index, fld) => {
          if ($(fld).attr('required') && $(fld).get(0).files.length == 0) {
            valid = false;
          }
        });
        return valid;
      }

      function disableForm(errorMsg) {
        $('af-form[ng-form="' + ctrl.getFormMeta().name + '"]')
          .addClass('disabled')
          .find('button[ng-click="afform.submit()"]').prop('disabled', true);
        CRM.alert(errorMsg, ts('Sorry'), 'error');
      }

      this.submit = function() {
        if (!ctrl.ngForm.$valid || !validateFileFields()) {
          CRM.alert(ts('Please fill all required fields.'), ts('Form Error'));
          return;
        }
        status = CRM.status({});
        $element.block();
        if (cancelDraftWatcher) {
          cancelDraftWatcher();
        }

        crmApi4('Afform', 'submit', {
          name: ctrl.getFormMeta().name,
          args: args,
          values: data,
        }).then(function(response) {
          submissionResponse = response;
          if (ctrl.fileUploader.getNotUploadedItems().length) {
            _.each(ctrl.fileUploader.getNotUploadedItems(), function(file) {
              file.formData.push({
                params: JSON.stringify(_.extend({
                  token: response[0].token,
                  name: ctrl.getFormMeta().name
                }, file.crmApiParams()))
              });
            });
            ctrl.fileUploader.uploadAll();
          } else {
            postProcess();
          }
        })
        .catch(function(error) {
          status.reject();
          $element.unblock();
          CRM.alert(error.error_message || '', ts('Form Error'));
        });
      };

      this.submitDraft = function() {
        if (uploadingDraftFiles) {
          return;
        }
        setDraftStatus('saving');
        status = CRM.status({start: ts('Saving Draft'), success: ts('Draft saved')});
        crmApi4('Afform', 'submitDraft', {
          name: ctrl.getFormMeta().name,
          args: args,
          values: data,
        }).then(function(response) {
          status.resolve();
          if (ctrl.fileUploader.getNotUploadedItems().length) {
            uploadingDraftFiles = true;
            _.each(ctrl.fileUploader.getNotUploadedItems(), function(file) {
              file.formData.push({
                params: JSON.stringify(_.extend({
                  name: ctrl.getFormMeta().name
                }, file.crmApiParams()))
              });
            });
            ctrl.fileUploader.uploadAll();
          } else {
            setDraftStatus('saved');
          }
        });
      };

      function getDraftButtons() {
        return $element.find('button[ng-click="afform.submitDraft()"]');
      }

      function setDraftStatus(newStatus) {
        if (draftStatus === newStatus) {
          return;
        }
        if (draftStatus === 'unsaved' && newStatus === 'saved') {
          return;
        }
        if (newStatus === 'unsaved' && !uploadingDraftFiles) {
          restoreDraftButtons();
        }
        else if (!uploadingDraftFiles) {
          const newText = newStatus === 'saving' ? ts('Saving Draft') : ts('Draft Saved');
          const newIcon = newStatus === 'saving' ? 'fa-spinner fa-spin' : 'fa-check';
          disableDraftButtons(newText, newIcon);
        }
        draftStatus = newStatus;
      }

      function disableDraftButtons(text, icon) {
        const buttons = getDraftButtons();
        $.each(buttons, function(index, button) {
          $(button).text(text).attr('disabled', true);
          $(button).prepend('<i class="crm-i ' + icon + '" aria-hidden="true"></i> ');
        });
      }

      function restoreDraftButtons() {
        const buttons = getDraftButtons();
        $.each(buttons, function(index, button) {
          const initialState = saveDraftButtons[index] || saveDraftButtons[0];
          $(button).text(initialState.text).attr('disabled', false);
          if (initialState.icon) {
            $(button).prepend('<i class="crm-i ' + saveDraftButtons[index].icon + '" aria-hidden="true"></i> ');
          }
        });
      }

    }
  });

angular.module('af').directive('afIf', function($compile, $animate, $parse) {
    return {
      multiElement: true,
      transclude: 'element',
      priority: 601,
      terminal: true,
      restrict: 'A',
      require: ['^^afForm'],
      $$tlb: true,
      link: function($scope, $element, $attr, ctrl, $transclude) {
        var block, childScope, previousElements;

        function watcher() {
          var conditions = $parse($attr.afIf)();
          return ctrl[0].checkConditions(conditions);
        }

        $scope.$watch(watcher, function(value) {
          if (value) {
            if (!childScope) {
              $transclude(function(clone, newScope) {
                childScope = newScope;
                clone[clone.length++] = $compile.$$createComment('end afIf', $attr.afIf);
                block = {
                  clone: clone
                };
                $animate.enter(clone, $element.parent(), $element);
              });
            }
          } else {
            if (previousElements) {
              previousElements.remove();
              previousElements = null;
            }
            if (childScope) {
              childScope.$broadcast('afIfDestroy');
              childScope.$destroy();
              childScope = null;
            }
            if (block) {
              previousElements = getBlockNodes(block.clone);
              $animate.leave(previousElements).done(function(response) {
                if (response !== false) previousElements = null;
              });
              block = null;
            }
          }
        });
      }
    };
  });

  /**
   * Return the DOM siblings between the first and last node in the given array.
   * @param {Array} array like object
   * @returns {Array} the inputted object or a jqLite collection containing the nodes
   */
  function getBlockNodes(nodes) {
    var node = nodes[0];
    var endNode = nodes[nodes.length - 1];
    var blockNodes;

    for (var i = 1; node !== endNode && (node = node.nextSibling); i++) {
      if (blockNodes || nodes[i] !== node) {
        if (!blockNodes) {
          blockNodes = $(slice.call(nodes, 0, i));
        }
        blockNodes.push(node);
      }
    }

    return blockNodes || nodes;
  }


angular.module('af')
    .directive('afJoin', function() {
      return {
        restrict: 'A',
        require: ['afJoin', '^^afFieldset', '?^^afRepeatItem'],
        bindToController: {
          entity: '@afJoin',
        },
        link: function($scope, $el, $attr, ctrls) {
          var self = ctrls[0];
          self.afFieldset = ctrls[1];
          self.repeatItem = ctrls[2];
          self.offset = self.afFieldset.getJoinOffset($attr.afJoin);
        },
        controller: function($scope) {
          var self = this;
          this.getEntityType = function() {
            return this.entity;
          };
          this.getData = function() {
            var data, fieldsetData;
            if (self.repeatItem) {
              data = self.repeatItem.item;
            } else {
              fieldsetData = self.afFieldset.getData();
              if (!fieldsetData.length) {
                fieldsetData.push({fields: {}, joins: {}});
              }
              data = fieldsetData[0];
            }
            if (!data.joins) {
              data.joins = {};
            }
            if (!data.joins[self.entity]) {
              data.joins[self.entity] = [];
            }
            return data.joins[self.entity];
          };
          this.getFieldData = function() {
            var data = this.getData();
            if (!data[this.offset]) {
              data[this.offset] = {};
            }
            return data[this.offset];
          };
        }
      };
    });

angular.module('af')
    .directive('afRepeat', function() {
      return {
        restrict: 'A',
        require: ['?afFieldset', '?afJoin'],
        transclude: true,
        scope: {
          min: '=',
          max: '=',
          addLabel: '@afRepeat',
          addIcon: '@',
          copyLabel: '@afCopy',
          copyIcon: '@'
        },
        templateUrl: '~/af/afRepeat.html',
        link: function($scope, $el, $attr, ctrls) {
          $scope.afFieldset = ctrls[0];
          $scope.afJoin = ctrls[1];
        },
        controller: function($scope) {
          this.getItems = $scope.getItems = function() {
            var data = getEntityController().getData();
            while ($scope.min && data.length < $scope.min) {
              data.push(getRepeatType() === 'join' ? {} : {fields: {}, joins: {}});
            }
            return data;
          };

          function getRepeatType() {
            return $scope.afJoin ? 'join' : 'fieldset';
          }
          this.getRepeatType = getRepeatType;

          function getEntityController() {
            return $scope.afJoin || $scope.afFieldset;
          }
          this.getEntityController = getEntityController;

          $scope.addItem = function() {
            $scope.getItems().push(getRepeatType() === 'join' ? {} : {fields: {}});
          };

          $scope.copyItem = function() {
            var data = $scope.getItems();
            var last = data[data.length-1];
            data.push(getRepeatType() === 'join' ? angular.copy(last) : {fields: angular.copy(last.fields)});
          };

          $scope.removeItem = function(index) {
            $scope.getItems().splice(index, 1);
          };

          $scope.canAdd = function() {
            return !$scope.max || $scope.getItems().length < $scope.max;
          };

          $scope.canRemove = function() {
            return !$scope.min || $scope.getItems().length > $scope.min;
          };
        }
      };
    })
    .directive('afRepeatItem', function() {
      return {
        restrict: 'A',
        require: {
          afRepeat: '^^',
          outerRepeatItem: '?^^afRepeatItem'
        },
        bindToController: {
          item: '=afRepeatItem',
          repeatIndex: '='
        },
        controller: function() {
          this.getFieldData = function() {
            return this.afRepeat.getRepeatType() === 'join' ? this.item : this.item.fields;
          };

          this.getEntityType = function() {
            return this.afRepeat.getEntityController().getEntityType();
          };
        }
      };
    });


  angular.module('af').component('afTabset', {
    templateUrl: '~/af/afTabset.html',
    transclude: true,
    controller: function($scope, $element) {
      this.tabs = [];

      this.$onInit = function() {
        $element.addClass('crm-tabset');
      };

      this.addTab = function(tab) {
        tab.tabSelected = !this.tabs.length;
        this.tabs.push(tab);
      };

      this.selectTab = function(tabIndex) {
        this.tabs.forEach(function(tab, index) {
          tab.tabSelected = index === tabIndex;
        });
      };
    }

  });

  angular.module('af').directive('afTab', function() {
    return {
      restrict: 'E',
      require: '^afTabset',
      scope: {
        title: '@',
        icon: '@',
        count: '@',
      },
      transclude: true,
      template: '<div ng-transclude role="tabpanel" ng-show="tabSelected" class="ng-hide"></div>',
      link: function (scope, element, attrs, afTabsetCtrl) {
        afTabsetCtrl.addTab(scope);
      }
    };
  });

  angular.module('af').directive('afTitle', function() {
    return {
      restrict: 'A',
      bindToController: {
        title: '@afTitle'
      },
      controller: function($scope, $element) {
        var ctrl = this;

        $scope.$watch(function() {return ctrl.title;}, function(text) {
          let tag = 'h4';
          if ($element.is('fieldset')) {
            tag = 'legend';
          }
          if ($element.is('details')) {
            tag = 'summary';
          }
          let $title = $element.children(tag + '.af-title');
          if (!$title.length) {
            $title = $('<' + tag + ' class="af-title" />').prependTo($element);
          }
          $title.text(text);
        });
      }
    };
  });

angular.module('afCore', CRM.angRequires('afCore'));
  angular.module('afCore').service('afCoreDirective', function($location, crmApi4, crmStatus, crmUiAlert) {
    return function(camelName, meta, d) {
      d.restrict = 'E';
      d.scope = {};
      d.scope.options = '=';
      d.link = {
        pre: function($scope, $el, $attr) {
          $scope.ts = CRM.ts(camelName);
          $scope.meta = meta;
          $scope.crmApi4 = crmApi4;
          $scope.crmStatus = crmStatus;
          $scope.crmUiAlert = crmUiAlert;
          $scope.crmUrl = CRM.url;
          $scope.checkPerm = CRM.checkPerm;

          $el.addClass('afform-directive');
          const dialog = $el.closest('.ui-dialog-content');
          if (!dialog.length) {
            $scope.$watch(function() {return $location.search();}, function(params) {
              $scope.routeParams = params;
            });
          } else {
            $scope.routeParams = {};
            if (typeof dialog.data('urlHash') === 'string' && dialog.data('urlHash').includes('?')) {
              const searchParams = new URLSearchParams(dialog.data('urlHash').split('?')[1]);
              searchParams.forEach(function(value, key) {
                $scope.routeParams[key] = value;
              });
            }
          }

          $scope.$parent.afformTitle = meta.title;
          $scope.addTitle = function(addition) {
            $scope.$parent.afformTitle = addition + ' ' + meta.title;
          };
        }
      };
      return d;
    };
  });

angular.module('afCore').directive('afApi3Ctrl', function() {
    return {
      restrict: 'EA',
      scope: {
        afApi3Ctrl: '=',
        afApi3: '@',
        afApi3Refresh: '@',
        onRefresh: '@'
      },
      controllerAs: 'afApi3Ctrl',
      controller: function($scope, $parse, crmThrottle, crmApi) {
        var ctrl = this;
        var parts = $parse($scope.afApi3)($scope.$parent);
        ctrl.entity = parts[0];
        ctrl.action = parts[1];
        ctrl.params = parts[2];
        ctrl.result = {};
        ctrl.loading = ctrl.firstLoad = true;

        ctrl.refresh = function refresh() {
          ctrl.loading = true;
          crmThrottle(function () {
            return crmApi(ctrl.entity, ctrl.action, ctrl.params)
              .then(function (response) {
                ctrl.result = response;
                ctrl.loading = ctrl.firstLoad = false;
                if ($scope.onRefresh) {
                  $scope.$parent.$eval($scope.onRefresh, ctrl);
                }
              });
          });
        };

        $scope.afApi3Ctrl = this;

        var mode = $scope.afApi3Refresh ? $scope.afApi3Refresh : 'auto';
        switch (mode) {
          case 'auto': $scope.$watchCollection('afApi3Ctrl.params', ctrl.refresh); break;
          case 'init': ctrl.refresh(); break;
          case 'manual': break;
          default: throw 'Unrecognized refresh mode: '+ mode;
        }
      }
    };
  });


angular.module('afCore').directive('afApi4Action', function($parse, crmStatus, crmApi4) {
    return {
      restrict: 'A',
      scope: {
        afApi4Action: '@',
        afApi4StartMsg: '=',
        afApi4ErrorMsg: '=',
        afApi4SuccessMsg: '=',
        afApi4Success: '@',
        onError: '@'
      },
      link: function($scope, $el, $attr) {
        var ts = CRM.ts(null);
        function running(x) {$el.toggleClass('af-api4-action-running', x).toggleClass('af-api4-action-idle', !x);}
        running(false);
        $el.click(function(){
          var parts = $parse($scope.afApi4Action)($scope.$parent);
          var msgs = {start: $scope.afApi4StartMsg || ts('Submitting...'), success: $scope.afApi4SuccessMsg, error: $scope.afApi4ErrorMsg};
          running(true);
          crmStatus(msgs, crmApi4(parts[0], parts[1], parts[2]))
            .finally(function(){running(false);})
            .then(function(response){$scope.$parent.$eval($scope.afApi4Success, {response: response});})
            .catch(function(error){$scope.$parent.$eval($scope.onError, {error: error});});
        });
      }
    };
  });


angular.module('afCore').directive('afApi4Ctrl', function() {
    return {
      restrict: 'EA',
      scope: {
        afApi4Ctrl: '=',
        afApi4: '@',
        afApi4Refresh: '@',
        onRefresh: '@'
      },
      controllerAs: 'afApi4Ctrl',
      controller: function($scope, $parse, crmThrottle, crmApi4) {
        var ctrl = this;
        var parts = $parse($scope.afApi4)($scope.$parent);
        ctrl.entity = parts[0];
        ctrl.action = parts[1];
        ctrl.params = parts[2];
        ctrl.index = parts[3];
        ctrl.result = {};
        ctrl.loading = ctrl.firstLoad = true;

        ctrl.refresh = function refresh() {
          ctrl.loading = true;
          crmThrottle(function () {
            return crmApi4(ctrl.entity, ctrl.action, ctrl.params, ctrl.index)
              .then(function (response) {
                ctrl.result = response;
                ctrl.loading = ctrl.firstLoad = false;
                if ($scope.onRefresh) {
                  $scope.$parent.$eval($scope.onRefresh, ctrl);
                }
              });
          });
        };

        $scope.afApi4Ctrl = this;

        var mode = $scope.afApi4Refresh ? $scope.afApi4Refresh : 'auto';
        switch (mode) {
          case 'auto':
            $scope.$watchCollection('afApi4Ctrl.params', ctrl.refresh, true);
            $scope.$watch('afApi4Ctrl.index', ctrl.refresh, true);
            $scope.$watch('afApi4Ctrl.entity', ctrl.refresh, true);
            $scope.$watch('afApi4Ctrl.action', ctrl.refresh, true);
            break;
          case 'init': ctrl.refresh(); break;
          case 'manual': break;
          default: throw 'Unrecognized refresh mode: '+ mode;
        }
      }
    };
  });


angular.module('afsearchTabDiscounts', CRM.angRequires('afsearchTabDiscounts'));
  angular.module('afsearchTabDiscounts').directive('afsearchTabDiscounts', function(afCoreDirective) {
    return afCoreDirective("afsearchTabDiscounts", {"title":"Codes Redeemed","name":"afsearchTabDiscounts","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabDiscounts\/afsearchTabDiscounts.aff.html"
    });
  });

angular.module('afsearchTabGrant', CRM.angRequires('afsearchTabGrant'));
  angular.module('afsearchTabGrant').directive('afsearchTabGrant', function(afCoreDirective) {
    return afCoreDirective("afsearchTabGrant", {"title":"Grants","name":"afsearchTabGrant","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabGrant\/afsearchTabGrant.aff.html"
    });
  });

angular.module('afsearchTabNote', CRM.angRequires('afsearchTabNote'));
  angular.module('afsearchTabNote').directive('afsearchTabNote', function(afCoreDirective) {
    return afCoreDirective("afsearchTabNote", {"title":"Notes","name":"afsearchTabNote","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabNote\/afsearchTabNote.aff.html"
    });
  });

angular.module('afsearchTabRel', CRM.angRequires('afsearchTabRel'));
  angular.module('afsearchTabRel').directive('afsearchTabRel', function(afCoreDirective) {
    return afCoreDirective("afsearchTabRel", {"title":"Relationships","name":"afsearchTabRel","redirect":null,"autosave_draft":null,"confirmation_type":"redirect_to_url","confirmation_message":null}, {
      templateUrl: "~\/afsearchTabRel\/afsearchTabRel.aff.html"
    });
  });
})(angular, CRM.$, CRM._);


/*
 angular-file-upload v2.6.1
 https://github.com/nervgh/angular-file-upload
*/

!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports["angular-file-upload"]=t():e["angular-file-upload"]=t()}(this,function(){return function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}var r=o(1),i=n(r),s=o(2),a=n(s),u=o(3),l=n(u),p=o(4),c=n(p),f=o(5),d=n(f),h=o(6),y=n(h),m=o(7),v=n(m),_=o(8),g=n(_),b=o(9),F=n(b),O=o(10),C=n(O),T=o(11),I=n(T),w=o(12),A=n(w),U=o(13),x=n(U);angular.module(i.default.name,[]).value("fileUploaderOptions",a.default).factory("FileUploader",l.default).factory("FileLikeObject",c.default).factory("FileItem",d.default).factory("FileDirective",y.default).factory("FileSelect",v.default).factory("FileDrop",F.default).factory("FileOver",C.default).factory("Pipeline",g.default).directive("nvFileSelect",I.default).directive("nvFileDrop",A.default).directive("nvFileOver",x.default).run(["FileUploader","FileLikeObject","FileItem","FileDirective","FileSelect","FileDrop","FileOver","Pipeline",function(e,t,o,n,r,i,s,a){e.FileLikeObject=t,e.FileItem=o,e.FileDirective=n,e.FileSelect=r,e.FileDrop=i,e.FileOver=s,e.Pipeline=a}])},function(e,t){e.exports={name:"angularFileUpload"}},function(e,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={url:"/",alias:"file",headers:{},queue:[],progress:0,autoUpload:!1,removeAfterUpload:!1,method:"POST",filters:[],formData:[],queueLimit:Number.MAX_VALUE,withCredentials:!1,disableMultipart:!1}},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t,o,n,i,a,u,g){var b=n.File,F=n.FormData,O=function(){function n(t){r(this,n);var o=p(e);c(this,o,t,{isUploading:!1,_nextIndex:0,_directives:{select:[],drop:[],over:[]}}),this.filters.unshift({name:"queueLimit",fn:this._queueLimitFilter}),this.filters.unshift({name:"folder",fn:this._folderFilter})}return n.prototype.addToQueue=function(e,t,o){var n=this,r=this.isArrayLikeObject(e)?Array.prototype.slice.call(e):[e],i=this._getFilters(o),l=this.queue.length,p=[],c=function e(){var o=r.shift();if(v(o))return f();var l=n.isFile(o)?o:new a(o),c=n._convertFiltersToPipes(i),d=new g(c),h=function(t){var o=t.pipe.originalFilter,r=s(t.args,2),i=r[0],a=r[1];n._onWhenAddingFileFailed(i,o,a),e()},y=function(t,o){var r=new u(n,t,o);p.push(r),n.queue.push(r),n._onAfterAddingFile(r),e()};d.onThrown=h,d.onSuccessful=y,d.exec(l,t)},f=function(){n.queue.length!==l&&(n._onAfterAddingAll(p),n.progress=n._getTotalProgress()),n._render(),n.autoUpload&&n.uploadAll()};c()},n.prototype.removeFromQueue=function(e){var t=this.getIndexOfItem(e),o=this.queue[t];o.isUploading&&o.cancel(),this.queue.splice(t,1),o._destroy(),this.progress=this._getTotalProgress()},n.prototype.clearQueue=function(){for(;this.queue.length;)this.queue[0].remove();this.progress=0},n.prototype.uploadItem=function(e){var t=this.getIndexOfItem(e),o=this.queue[t],n=this.isHTML5?"_xhrTransport":"_iframeTransport";o._prepareToUploading(),this.isUploading||(this._onBeforeUploadItem(o),o.isCancel||(o.isUploading=!0,this.isUploading=!0,this[n](o),this._render()))},n.prototype.cancelItem=function(e){var t=this,o=this.getIndexOfItem(e),n=this.queue[o],r=this.isHTML5?"_xhr":"_form";if(n)if(n.isCancel=!0,n.isUploading)n[r].abort();else{var s=[void 0,0,{}],a=function(){t._onCancelItem.apply(t,[n].concat(s)),t._onCompleteItem.apply(t,[n].concat(s))};i(a)}},n.prototype.uploadAll=function(){var e=this.getNotUploadedItems().filter(function(e){return!e.isUploading});e.length&&(f(e,function(e){return e._prepareToUploading()}),e[0].upload())},n.prototype.cancelAll=function(){var e=this.getNotUploadedItems();f(e,function(e){return e.cancel()})},n.prototype.isFile=function(e){return this.constructor.isFile(e)},n.prototype.isFileLikeObject=function(e){return this.constructor.isFileLikeObject(e)},n.prototype.isArrayLikeObject=function(e){return this.constructor.isArrayLikeObject(e)},n.prototype.getIndexOfItem=function(e){return h(e)?e:this.queue.indexOf(e)},n.prototype.getNotUploadedItems=function(){return this.queue.filter(function(e){return!e.isUploaded})},n.prototype.getReadyItems=function(){return this.queue.filter(function(e){return e.isReady&&!e.isUploading}).sort(function(e,t){return e.index-t.index})},n.prototype.destroy=function(){var e=this;f(this._directives,function(t){f(e._directives[t],function(e){e.destroy()})})},n.prototype.onAfterAddingAll=function(e){},n.prototype.onAfterAddingFile=function(e){},n.prototype.onWhenAddingFileFailed=function(e,t,o){},n.prototype.onBeforeUploadItem=function(e){},n.prototype.onProgressItem=function(e,t){},n.prototype.onProgressAll=function(e){},n.prototype.onSuccessItem=function(e,t,o,n){},n.prototype.onErrorItem=function(e,t,o,n){},n.prototype.onCancelItem=function(e,t,o,n){},n.prototype.onCompleteItem=function(e,t,o,n){},n.prototype.onTimeoutItem=function(e){},n.prototype.onCompleteAll=function(){},n.prototype._getTotalProgress=function(e){if(this.removeAfterUpload)return e||0;var t=this.getNotUploadedItems().length,o=t?this.queue.length-t:this.queue.length,n=100/this.queue.length,r=(e||0)*n/100;return Math.round(o*n+r)},n.prototype._getFilters=function(e){if(!e)return this.filters;if(m(e))return e;var t=e.match(/[^\s,]+/g);return this.filters.filter(function(e){return t.indexOf(e.name)!==-1})},n.prototype._convertFiltersToPipes=function(e){var t=this;return e.map(function(e){var o=l(t,e.fn);return o.isAsync=3===e.fn.length,o.originalFilter=e,o})},n.prototype._render=function(){t.$$phase||t.$apply()},n.prototype._folderFilter=function(e){return!(!e.size&&!e.type)},n.prototype._queueLimitFilter=function(){return this.queue.length<this.queueLimit},n.prototype._isSuccessCode=function(e){return e>=200&&e<300||304===e},n.prototype._transformResponse=function(e,t){var n=this._headersGetter(t);return f(o.defaults.transformResponse,function(t){e=t(e,n)}),e},n.prototype._parseHeaders=function(e){var t,o,n,r={};return e?(f(e.split("\n"),function(e){n=e.indexOf(":"),t=e.slice(0,n).trim().toLowerCase(),o=e.slice(n+1).trim(),t&&(r[t]=r[t]?r[t]+", "+o:o)}),r):r},n.prototype._headersGetter=function(e){return function(t){return t?e[t.toLowerCase()]||null:e}},n.prototype._xhrTransport=function(e){var t,o=this,n=e._xhr=new XMLHttpRequest;if(e.disableMultipart?t=e._file:(t=new F,f(e.formData,function(e){f(e,function(e,o){t.append(o,e)})}),t.append(e.alias,e._file,e.file.name)),"number"!=typeof e._file.size)throw new TypeError("The file specified is no longer valid");n.upload.onprogress=function(t){var n=Math.round(t.lengthComputable?100*t.loaded/t.total:0);o._onProgressItem(e,n)},n.onload=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t),i=o._isSuccessCode(n.status)?"Success":"Error",s="_on"+i+"Item";o[s](e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.onerror=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t);o._onErrorItem(e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.onabort=function(){var t=o._parseHeaders(n.getAllResponseHeaders()),r=o._transformResponse(n.response,t);o._onCancelItem(e,r,n.status,t),o._onCompleteItem(e,r,n.status,t)},n.ontimeout=function(t){var r=o._parseHeaders(n.getAllResponseHeaders()),i="Request Timeout.";o._onTimeoutItem(e),o._onCompleteItem(e,i,408,r)},n.open(e.method,e.url,!0),n.timeout=e.timeout||0,n.withCredentials=e.withCredentials,f(e.headers,function(e,t){n.setRequestHeader(t,e)}),n.send(t)},n.prototype._iframeTransport=function(e){var t=this,o=_('<form style="display: none;" />'),n=_('<iframe name="iframeTransport'+Date.now()+'">'),r=e._input,i=0,s=null,a=!1;e._form&&e._form.replaceWith(r),e._form=o,r.prop("name",e.alias),f(e.formData,function(e){f(e,function(e,t){var n=_('<input type="hidden" name="'+t+'" />');n.val(e),o.append(n)})}),o.prop({action:e.url,method:"POST",target:n.prop("name"),enctype:"multipart/form-data",encoding:"multipart/form-data"}),n.bind("load",function(){var o="",r=200;try{o=n[0].contentDocument.body.innerHTML}catch(e){r=500}if(s&&clearTimeout(s),s=null,a)return!1;var i={response:o,status:r,dummy:!0},u={},l=t._transformResponse(i.response,u);t._onSuccessItem(e,l,i.status,u),t._onCompleteItem(e,l,i.status,u)}),o.abort=function(){var i,s={status:0,dummy:!0},a={};n.unbind("load").prop("src","javascript:false;"),o.replaceWith(r),t._onCancelItem(e,i,s.status,a),t._onCompleteItem(e,i,s.status,a)},r.after(o),o.append(r).append(n),i=e.timeout||0,s=null,i&&(s=setTimeout(function(){a=!0,e.isCancel=!0,e.isUploading&&(n.unbind("load").prop("src","javascript:false;"),o.replaceWith(r));var i={},s="Request Timeout.";t._onTimeoutItem(e),t._onCompleteItem(e,s,408,i)},i)),o[0].submit()},n.prototype._onWhenAddingFileFailed=function(e,t,o){this.onWhenAddingFileFailed(e,t,o)},n.prototype._onAfterAddingFile=function(e){this.onAfterAddingFile(e)},n.prototype._onAfterAddingAll=function(e){this.onAfterAddingAll(e)},n.prototype._onBeforeUploadItem=function(e){e._onBeforeUpload(),this.onBeforeUploadItem(e)},n.prototype._onProgressItem=function(e,t){var o=this._getTotalProgress(t);this.progress=o,e._onProgress(t),this.onProgressItem(e,t),this.onProgressAll(o),this._render()},n.prototype._onSuccessItem=function(e,t,o,n){e._onSuccess(t,o,n),this.onSuccessItem(e,t,o,n)},n.prototype._onErrorItem=function(e,t,o,n){e._onError(t,o,n),this.onErrorItem(e,t,o,n)},n.prototype._onCancelItem=function(e,t,o,n){e._onCancel(t,o,n),this.onCancelItem(e,t,o,n)},n.prototype._onCompleteItem=function(e,t,o,n){e._onComplete(t,o,n),this.onCompleteItem(e,t,o,n);var r=this.getReadyItems()[0];return this.isUploading=!1,y(r)?void r.upload():(this.onCompleteAll(),this.progress=this._getTotalProgress(),void this._render())},n.prototype._onTimeoutItem=function(e){e._onTimeout(),this.onTimeoutItem(e)},n.isFile=function(e){return b&&e instanceof b},n.isFileLikeObject=function(e){return e instanceof a},n.isArrayLikeObject=function(e){return d(e)&&"length"in e},n.inherit=function(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.super_=t},n}();return O.prototype.isHTML5=!(!b||!F),O.isHTML5=O.prototype.isHTML5,O}Object.defineProperty(t,"__esModule",{value:!0});var s=function(){function e(e,t){var o=[],n=!0,r=!1,i=void 0;try{for(var s,a=e[Symbol.iterator]();!(n=(s=a.next()).done)&&(o.push(s.value),!t||o.length!==t);n=!0);}catch(e){r=!0,i=e}finally{try{!n&&a.return&&a.return()}finally{if(r)throw i}}return o}return function(t,o){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,o);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();t.default=i;var a=o(1),u=(n(a),angular),l=u.bind,p=u.copy,c=u.extend,f=u.forEach,d=u.isObject,h=u.isNumber,y=u.isDefined,m=u.isArray,v=u.isUndefined,_=u.element;i.$inject=["fileUploaderOptions","$rootScope","$http","$window","$timeout","FileLikeObject","FileItem","Pipeline"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(){return function(){function e(t){r(this,e);var o=l(t),n=o?t.value:t,i=p(n)?"FakePath":"Object",s="_createFrom"+i;this[s](n,t)}return e.prototype._createFromFakePath=function(e,t){this.lastModifiedDate=null,this.size=null,this.type="like/"+e.slice(e.lastIndexOf(".")+1).toLowerCase(),this.name=e.slice(e.lastIndexOf("/")+e.lastIndexOf("\\")+2),this.input=t},e.prototype._createFromObject=function(e){this.lastModifiedDate=u(e.lastModifiedDate),this.size=e.size,this.type=e.type,this.name=e.name,this.input=e.input},e}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.copy,l=a.isElement,p=a.isString},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){return function(){function o(e,n,i){r(this,o);var s=!!n.input,a=s?p(n.input):null,c=s?null:n;l(this,{url:e.url,alias:e.alias,headers:u(e.headers),formData:u(e.formData),removeAfterUpload:e.removeAfterUpload,withCredentials:e.withCredentials,disableMultipart:e.disableMultipart,method:e.method,timeout:e.timeout},i,{uploader:e,file:new t(n),isReady:!1,isUploading:!1,isUploaded:!1,isSuccess:!1,isCancel:!1,isError:!1,progress:0,index:null,_file:c,_input:a}),a&&this._replaceNode(a)}return o.prototype.upload=function(){try{this.uploader.uploadItem(this)}catch(t){var e=t.name+":"+t.message;this.uploader._onCompleteItem(this,e,t.code,[]),this.uploader._onErrorItem(this,e,t.code,[])}},o.prototype.cancel=function(){this.uploader.cancelItem(this)},o.prototype.remove=function(){this.uploader.removeFromQueue(this)},o.prototype.onBeforeUpload=function(){},o.prototype.onProgress=function(e){},o.prototype.onSuccess=function(e,t,o){},o.prototype.onError=function(e,t,o){},o.prototype.onCancel=function(e,t,o){},o.prototype.onComplete=function(e,t,o){},o.prototype.onTimeout=function(){},o.prototype._onBeforeUpload=function(){this.isReady=!0,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!1,this.progress=0,this.onBeforeUpload()},o.prototype._onProgress=function(e){this.progress=e,this.onProgress(e)},o.prototype._onSuccess=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!0,this.isCancel=!1,this.isError=!1,this.progress=100,this.index=null,this.onSuccess(e,t,o)},o.prototype._onError=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!0,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onError(e,t,o)},o.prototype._onCancel=function(e,t,o){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!0,this.isError=!1,this.progress=0,this.index=null,this.onCancel(e,t,o)},o.prototype._onComplete=function(e,t,o){this.onComplete(e,t,o),this.removeAfterUpload&&this.remove()},o.prototype._onTimeout=function(){this.isReady=!1,this.isUploading=!1,this.isUploaded=!1,this.isSuccess=!1,this.isCancel=!1,this.isError=!0,this.progress=0,this.index=null,this.onTimeout()},o.prototype._destroy=function(){this._input&&this._input.remove(),this._form&&this._form.remove(),delete this._form,delete this._input},o.prototype._prepareToUploading=function(){this.index=this.index||++this.uploader._nextIndex,this.isReady=!0},o.prototype._replaceNode=function(t){var o=e(t.clone())(t.scope());o.prop("value",null),t.css("display","none"),t.after(o)},o}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.copy,l=a.extend,p=a.element;a.isElement;i.$inject=["$compile","FileLikeObject"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(){var e=function(){function e(t){r(this,e),u(this,t),this.uploader._directives[this.prop].push(this),this._saveLinks(),this.bind()}return e.prototype.bind=function(){for(var e in this.events){var t=this.events[e];this.element.bind(e,this[t])}},e.prototype.unbind=function(){for(var e in this.events)this.element.unbind(e,this.events[e])},e.prototype.destroy=function(){var e=this.uploader._directives[this.prop].indexOf(this);this.uploader._directives[this.prop].splice(e,1),this.unbind()},e.prototype._saveLinks=function(){for(var e in this.events){var t=this.events[e];this[t]=this[t].bind(this)}},e}();return e.prototype.events={},e}Object.defineProperty(t,"__esModule",{value:!0}),t.default=i;var s=o(1),a=(n(s),angular),u=a.extend},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e,t){return function(t){function o(e){r(this,o);var n=p(e,{events:{$destroy:"destroy",change:"onChange"},prop:"select"}),s=i(this,t.call(this,n));return s.uploader.isHTML5||s.element.removeAttr("multiple"),s.element.prop("value",null),s}return s(o,t),o.prototype.getOptions=function(){},o.prototype.getFilters=function(){},o.prototype.isEmptyAfterSelection=function(){return!!this.element.attr("multiple")},o.prototype.onChange=function(){var t=this.uploader.isHTML5?this.element[0].files:this.element[0],o=this.getOptions(),n=this.getFilters();this.uploader.isHTML5||this.destroy(),this.uploader.addToQueue(t,o,n),this.isEmptyAfterSelection()&&(this.element.prop("value",null),this.element.replaceWith(e(this.element.clone())(this.scope)))},o}(t)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend;a.$inject=["$compile","FileDirective"]},function(e,t){"use strict";function o(e){if(Array.isArray(e)){for(var t=0,o=Array(e.length);t<e.length;t++)o[t]=e[t];return o}return Array.from(e)}function n(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function r(e){return function(){function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[];n(this,t),this.pipes=e}return t.prototype.next=function(t){var n=this.pipes.shift();if(a(n))return void this.onSuccessful.apply(this,o(t));var r=new Error("The filter has not passed");if(r.pipe=n,r.args=t,n.isAsync){var i=e.defer(),u=s(this,this.next,t),l=s(this,this.onThrown,r);i.promise.then(u,l),n.apply(void 0,o(t).concat([i]))}else{var p=Boolean(n.apply(void 0,o(t)));p?this.next(t):this.onThrown(r)}},t.prototype.exec=function(){for(var e=arguments.length,t=Array(e),o=0;o<e;o++)t[o]=arguments[o];this.next(t)},t.prototype.onThrown=function(e){},t.prototype.onSuccessful=function(){},t}()}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=angular,s=i.bind,a=i.isUndefined;r.$inject=["$q"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){return function(e){function t(o){r(this,t);var n=p(o,{events:{$destroy:"destroy",drop:"onDrop",dragover:"onDragOver",dragleave:"onDragLeave"},prop:"drop"});return i(this,e.call(this,n))}return s(t,e),t.prototype.getOptions=function(){},t.prototype.getFilters=function(){},t.prototype.onDrop=function(e){var t=this._getTransfer(e);if(t){var o=this.getOptions(),n=this.getFilters();this._preventAndStop(e),c(this.uploader._directives.over,this._removeOverClass,this),this.uploader.addToQueue(t.files,o,n)}},t.prototype.onDragOver=function(e){var t=this._getTransfer(e);this._haveFiles(t.types)&&(t.dropEffect="copy",this._preventAndStop(e),c(this.uploader._directives.over,this._addOverClass,this))},t.prototype.onDragLeave=function(e){e.currentTarget!==this.element[0]&&(this._preventAndStop(e),c(this.uploader._directives.over,this._removeOverClass,this))},t.prototype._getTransfer=function(e){return e.dataTransfer?e.dataTransfer:e.originalEvent.dataTransfer},t.prototype._preventAndStop=function(e){e.preventDefault(),e.stopPropagation()},t.prototype._haveFiles=function(e){return!!e&&(e.indexOf?e.indexOf("Files")!==-1:!!e.contains&&e.contains("Files"))},t.prototype._addOverClass=function(e){e.addOverClass()},t.prototype._removeOverClass=function(e){e.removeOverClass()},t}(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend,c=l.forEach;a.$inject=["FileDirective"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function s(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function a(e){return function(e){function t(o){r(this,t);var n=p(o,{events:{$destroy:"destroy"},prop:"over",overClass:"nv-file-over"});return i(this,e.call(this,n))}return s(t,e),t.prototype.addOverClass=function(){this.element.addClass(this.getOverClass())},t.prototype.removeOverClass=function(){this.element.removeClass(this.getOverClass())},t.prototype.getOverClass=function(){return this.overClass},t}(e)}Object.defineProperty(t,"__esModule",{value:!0}),t.default=a;var u=o(1),l=(n(u),angular),p=l.extend;a.$inject=["FileDirective"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t,o){return{link:function(n,r,i){var s=n.$eval(i.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');var a=new o({uploader:s,element:r,scope:n});a.getOptions=e(i.options).bind(a,n),a.getFilters=function(){return i.filters}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["$parse","FileUploader","FileSelect"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t,o){return{link:function(n,r,i){var s=n.$eval(i.uploader);if(!(s instanceof t))throw new TypeError('"Uploader" must be an instance of FileUploader');if(s.isHTML5){var a=new o({uploader:s,element:r});a.getOptions=e(i.options).bind(a,n),a.getFilters=function(){return i.filters}}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["$parse","FileUploader","FileDrop"]},function(e,t,o){"use strict";function n(e){return e&&e.__esModule?e:{default:e}}function r(e,t){return{link:function(o,n,r){var i=o.$eval(r.uploader);if(!(i instanceof e))throw new TypeError('"Uploader" must be an instance of FileUploader');var s=new t({uploader:i,element:n});s.getOverClass=function(){return r.overClass||s.overClass}}}}Object.defineProperty(t,"__esModule",{value:!0}),t.default=r;var i=o(1);n(i);r.$inject=["FileUploader","FileOver"]}])});

(function(angular, $, _) {
  angular.module('api4', CRM.angRequires('api4'));

angular.module('api4').factory('crmApi4', function($q) {
    var crmApi4 = function(entity, action, params, index) {
      var deferred = $q.defer();
      var p;
      var backend = crmApi4.backend || CRM.api4;
      if (_.isObject(entity)) {
        /*jshint -W061 */
        p = backend(eval('('+angular.toJson(entity)+')'), action);
      } else {
        /*jshint -W061 */
        p = backend(entity, action, eval('('+angular.toJson(params)+')'), index);
      }
      p.then(
        function(result) {
          deferred.resolve(result);
        },
        function(error) {
          deferred.reject(error);
        }
      );
      return deferred.promise;
    };
    crmApi4.backend = null;
    crmApi4.val = function(value) {
      var d = $.Deferred();
      d.resolve(value);
      return d.promise();
    };
    return crmApi4;
  });

})(angular, CRM.$, CRM._);

/**
 * Checklist-model
 * AngularJS directive for list of checkboxes
 * https://github.com/vitalets/checklist-model
 * License: MIT http://opensource.org/licenses/MIT
 */

 /* commonjs package manager support (eg componentjs) */
 if (typeof module !== "undefined" && typeof exports !== "undefined" && module.exports === exports){
   module.exports = 'checklist-model';
 }

angular.module('checklist-model', [])
.directive('checklistModel', ['$parse', '$compile', function($parse, $compile) {
  function contains(arr, item, comparator) {
    if (angular.isArray(arr)) {
      for (var i = arr.length; i--;) {
        if (comparator(arr[i], item)) {
          return true;
        }
      }
    }
    return false;
  }
  function add(arr, item, comparator) {
    arr = angular.isArray(arr) ? arr : [];
      if(!contains(arr, item, comparator)) {
          arr.push(item);
      }
    return arr;
  }
  function remove(arr, item, comparator) {
    if (angular.isArray(arr)) {
      for (var i = arr.length; i--;) {
        if (comparator(arr[i], item)) {
          arr.splice(i, 1);
          break;
        }
      }
    }
    return arr;
  }
  function postLinkFn(scope, elem, attrs) {
    var checklistModel = attrs.checklistModel;
    attrs.$set("checklistModel", null);
    $compile(elem)(scope);
    attrs.$set("checklistModel", checklistModel);
    var checklistModelGetter = $parse(checklistModel);
    var checklistChange = $parse(attrs.checklistChange);
    var checklistBeforeChange = $parse(attrs.checklistBeforeChange);
    var ngModelGetter = $parse(attrs.ngModel);



    var comparator = function (a, b) {
      if(!isNaN(a) && !isNaN(b)) {
        return String(a) === String(b);
      } else {
        return angular.equals(a,b);
      }
    };

    if (attrs.hasOwnProperty('checklistComparator')){
      if (attrs.checklistComparator[0] == '.') {
        var comparatorExpression = attrs.checklistComparator.substring(1);
        comparator = function (a, b) {
          return a[comparatorExpression] === b[comparatorExpression];
        };

      } else {
        comparator = $parse(attrs.checklistComparator)(scope.$parent);
      }
    }
    var unbindModel = scope.$watch(attrs.ngModel, function(newValue, oldValue) {
      if (newValue === oldValue) {
        return;
      }

      if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
        ngModelGetter.assign(scope, contains(checklistModelGetter(scope.$parent), getChecklistValue(), comparator));
        return;
      }

      setValueInChecklistModel(getChecklistValue(), newValue);

      if (checklistChange) {
        checklistChange(scope);
      }
    });
    var unbindCheckListValue = scope.$watch(getChecklistValue, function(newValue, oldValue) {
      if( newValue != oldValue && angular.isDefined(oldValue) && scope[attrs.ngModel] === true ) {
        var current = checklistModelGetter(scope.$parent);
        checklistModelGetter.assign(scope.$parent, remove(current, oldValue, comparator));
        checklistModelGetter.assign(scope.$parent, add(current, newValue, comparator));
      }
    }, true);

    var unbindDestroy = scope.$on('$destroy', destroy);

    function destroy() {
      unbindModel();
      unbindCheckListValue();
      unbindDestroy();
    }

    function getChecklistValue() {
      return attrs.checklistValue ? $parse(attrs.checklistValue)(scope.$parent) : attrs.value;
    }

    function setValueInChecklistModel(value, checked) {
      var current = checklistModelGetter(scope.$parent);
      if (angular.isFunction(checklistModelGetter.assign)) {
        if (checked === true) {
          checklistModelGetter.assign(scope.$parent, add(current, value, comparator));
        } else {
          checklistModelGetter.assign(scope.$parent, remove(current, value, comparator));
        }
      }

    }
    function setChecked(newArr, oldArr) {
      if (checklistBeforeChange && (checklistBeforeChange(scope) === false)) {
        setValueInChecklistModel(getChecklistValue(), ngModelGetter(scope));
        return;
      }
      ngModelGetter.assign(scope, contains(newArr, getChecklistValue(), comparator));
    }
    if (angular.isFunction(scope.$parent.$watchCollection)) {
        scope.$parent.$watchCollection(checklistModel, setChecked);
    } else {
        scope.$parent.$watch(checklistModel, setChecked, true);
    }
  }

  return {
    restrict: 'A',
    priority: 1000,
    terminal: true,
    scope: true,
    compile: function(tElement, tAttrs) {

      if (!tAttrs.checklistValue && !tAttrs.value) {
        throw 'You should provide `value` or `checklist-value`.';
      }
      if (!tAttrs.ngModel) {
        tAttrs.$set("ngModel", "checked");
      }

      return postLinkFn;
    }
  };
}]);

(function(angular, $, _) {
  "use strict";

  angular.module('crmDialog', CRM.angRequires('crmDialog'));
  angular.module('crmDialog').directive('crmDialogPopup', function(dialogService) {
    return {
      restrict: 'A',
      bindToController: {
        popupTpl: '@',
        popupName: '@crmDialogPopup',
        popupData: '<'
      },
      controller: function($scope, $element) {
        var ctrl = this;
        $element.on('click', function() {
          var options = CRM.utils.adjustDialogDefaults({
            autoOpen: false,
            title: _.trim($element.attr('title') || $element.text())
          });
          dialogService.open(ctrl.popupName, ctrl.popupTpl, ctrl.popupData || {}, options)
            .then(function(success) {
              $element.trigger('crmPopupFormSuccess');
            });
        });
      }
    };
  });
  angular.module('crmDialog').directive('crmDialog', function(dialogService) {
    return {
      restrict: 'A',
      controllerAs: '$dialog',
      controller: function($scope, $parse, $timeout) {
        var $dialog = this;
        $dialog.buttons = [];

        $dialog.close = function(result) {
          dialogService.close($dialog.name, result);
        };

        $dialog.cancel = function() {
          dialogService.cancel($dialog.name);
        };

        $dialog.loadButtons = function() {
          var buttons = [];
          angular.forEach($dialog.buttons, function (crmDialogButton) {
            var button = _.pick(crmDialogButton, ['icons', 'text', 'disabled']);
            button.click = function() {
              $scope.$apply(crmDialogButton.onClick);
            };
            buttons.push(button);
          });
          dialogService.setButtons($dialog.name, buttons);
        };

        $timeout(function() {
          $('.ui-dialog:last input:not([disabled]):not([type="submit"]):first').focus();
        });

      },
      link: function(scope, element, attrs, controller) {
        controller.name = attrs.crmDialog;
        scope[attrs.crmDialog] = controller;
      }
    };
  });
  angular.module('crmDialog').component('crmDialogButton', {
    bindings: {
      disabled: '<',
      icons: '<',
      text: '<',
      onClick: '&'
    },
    require: {
      crmDialog: '?^^crmDialog'
    },
    controller: function($scope) {
      var $ctrl = this;
      $ctrl.$onInit = function() {
        $ctrl.crmDialog.buttons.push(this);
        $scope.$watch('$ctrl.disabled', $ctrl.crmDialog.loadButtons);
        $scope.$watch('$ctrl.text', $ctrl.crmDialog.loadButtons);
        $scope.$watch('$ctrl.icons', $ctrl.crmDialog.loadButtons);
      };
    }
  });


angular.module('crmResource', []);

  angular.module('crmResource').factory('crmResource', function($q, $http) {
    var deferreds = {}; // null|object; deferreds[url][idx] = Deferred;

    var notify = function notify() {
      var oldDfrds = deferreds;
      deferreds = null;

      angular.forEach(oldDfrds, function(dfrs, url) {
        if (CRM.angular.templates[url]) {
          angular.forEach(dfrs, function(dfr) {
            dfr.resolve({
              status: 200,
              headers: function(name) {
                var headers = {'Content-type': 'text/html'};
                return name ? headers[name] : headers;
              },
              data: CRM.angular.templates[url]
            });
          });
        }
        else {
          angular.forEach(dfrs, function(dfr) {
            dfr.reject({status: 500}); // FIXME
          });
        }
      });
    };

    var moduleUrl = CRM.angular.bundleUrl;
    $http.get(moduleUrl)
      .then(function httpSuccess(response) {
        CRM.angular.templates = CRM.angular.templates || {};
        angular.forEach(response.data, function (module) {
          if (module.partials) {
            angular.extend(CRM.angular.templates, module.partials);
          }
          if (module.strings) {
            CRM.addStrings(module.domain, module.strings);
          }
        });
        notify();
      }, function httpError() {
        notify();
      });

    return {
      getUrl: function getUrl(url) {
        if (CRM.angular.templates && CRM.angular.templates[url]) {
          return CRM.angular.templates[url];
        }
        else {
          var deferred = $q.defer();
          if (!deferreds[url]) {
            deferreds[url] = [];
          }
          deferreds[url].push(deferred);
          return deferred.promise;
        }
      }
    };
  });

  angular.module('crmResource').config(function($provide) {
    $provide.decorator('$templateCache', function($delegate, $http, $q, crmResource) {
      var origGet = $delegate.get;
      var urlPat = /^~\//;
      $delegate.get = function(url) {
        if (urlPat.test(url)) {
          return crmResource.getUrl(url);
        }
        else {
          return origGet.call(this, url);
        }
      };
      return $delegate;
    });
  });


  angular.module('crmSearchDisplay', CRM.angRequires('crmSearchDisplay'));



  var optionsCache = {};

  angular.module('crmSearchDisplay').component('crmSearchDisplayEditable', {
    bindings: {
      row: '<?',
      display: '<',
      colKey: '<',
      colData: '<?',
      isFullRowMode: '<',
    },
    templateUrl: '~/crmSearchDisplay/crmSearchDisplayEditable.html',
    controller: function($scope, $element, crmApi4, crmStatus) {
      const ctrl = this;
      let initialValue;
      let editableInfo;
      let valuePath;

      this.$onInit = function() {
        editableInfo = this.display.results.editable[this.colKey];
        valuePath = this.colKey.split(':')[0];
        this.display.editValues = this.display.editValues || {};
        if (this.row) {
          initialValue = JSON.parse(JSON.stringify(this.row.data[valuePath]));
          this.display.editValues[this.colKey] = JSON.parse(JSON.stringify(this.row.data[valuePath]));
        }

        this.field = {
          data_type: editableInfo.data_type,
          input_type: editableInfo.input_type,
          entity: editableInfo.entity,
          name: editableInfo.value_key,
          options: editableInfo.options,
          fk_entity: editableInfo.fk_entity,
          serialize: editableInfo.serialize,
          nullable: editableInfo.nullable && ctrl.row && ctrl.row.data[editableInfo.id_path],
        };

        if (this.field.options === true) {
          loadOptions();
        }

        $(document).off('.crmSearchDisplayEditable');
        $(document).on('keydown.crmSearchDisplayEditable', (e) => {
          if (e.key === 'Escape') {
            $scope.$apply(() => ctrl.cancel());
          }
          else if (e.key === 'Enter') {
            $scope.$apply(() => ctrl.save());
          }
        });
      };

      this.$onDestroy = function() {
        $(document).off('.crmSearchDisplayEditable');
      };

      this.save = function() {
        const value = ctrl.display.editValues[ctrl.colKey];
        if (value !== initialValue || ctrl.isFullRowMode) {
          ctrl.display.saveEditing(ctrl.row, ctrl.colKey);
        }
        else {
          ctrl.display.cancelEditing(ctrl.row);
        }
      };

      this.cancel = function() {
        ctrl.display.cancelEditing(ctrl.row);
      };
      function loadOptions() {
        crmApi4(editableInfo.entity, 'getFields', {
          action: 'update',
          select: ['options'],
          values: ctrl.row && ctrl.row.data,
          loadOptions: ['id', 'name', 'label', 'description', 'color', 'icon'],
          where: [['name', '=', ctrl.field.name]]
        }, 0).then(function(fieldInfo) {
          ctrl.field.options = fieldInfo.options;
        });
      }
    }
  });


  angular.module('crmSearchDisplay').factory('searchDisplayBaseTrait', function($timeout, $interval, crmApi4, crmStatus) {
    return {
      page: 1,
      rowCount: null,
      onInitialize: [],
      onChangeFilters: [],
      onPreRun: [],
      onPostRun: [],
      _runCount: 0,
      isArray: Array.isArray,
      initializeDisplay: function($scope, $element) {
        var ctrl = this;
        this.$element = $element;
        this.limit = this.settings.limit;
        this.sort = this.settings.sort ? _.cloneDeep(this.settings.sort) : [];
        this.seed = Date.now();
        this.uniqueId = generateUniqueId(20);
        this.placeholders = [];
        var placeholderCount = 'placeholder' in this.settings ? this.settings.placeholder : 5;
        for (var p=0; p < placeholderCount; ++p) {
          this.placeholders.push({});
        }
        _.each(ctrl.onInitialize, function(callback) {
          callback.call(ctrl, $scope, $element);
        });
        this.getResultsPronto = _.debounce(ctrl.runSearch, 300, {leading: true, trailing: false});
        this.getResultsSoon = _.debounce(function() {
          $scope.$apply(function() {
            ctrl.runSearch();
          });
        }, 600);
        let contactTab = $element.closest('.crm-contact-page .ui-tabs-panel').attr('id');
        if (contactTab && !$element.is($('#' + contactTab + ' [search][display]').first())) {
          contactTab = null;
        }
        let hasCounter = contactTab || ctrl.hasOwnProperty('totalCount');
        if (hasCounter) {
          $scope.$watch('$ctrl.rowCount', function(rowCount) {
            if (typeof rowCount === 'number' && angular.equals({}, ctrl.getAfformFilters())) {
              setTotalCount(rowCount);
            }
          });
        }

        function setTotalCount(rowCount) {
          if (ctrl.hasOwnProperty('totalCount')) {
            ctrl.totalCount = rowCount;
          }
          if (contactTab) {
            CRM.tabHeader.updateCount(contactTab.replace('contact-', '#tab_'), rowCount);
          }
        }

        function generateUniqueId(length) {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let result = "";
          for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        }
        $element.closest('form').on('crmPopupFormSuccess crmFormSuccess', function() {
          ctrl.rowCount = null;
          ctrl.getResultsPronto();
        });
        function onChangeFilters() {
          ctrl.page = 1;
          ctrl.rowCount = null;
          _.each(ctrl.onChangeFilters, function(callback) {
            callback.call(ctrl);
          });
          if (!ctrl.settings.button) {
            ctrl.getResultsSoon();
          }
        }

        function onChangePageSize() {
          ctrl.page = 1;
          if (ctrl.results) {
            ctrl.getResultsSoon();
          }
        }
        if (this.settings.toolbar) {
          this.onPostRun.push(function (apiResults) {
            if (apiResults.run.toolbar) {
              ctrl.toolbar = apiResults.run.toolbar;
              ctrl.toolbar.forEach((link) => {
                if (link.autoOpen && ctrl._runCount === 1 && !ctrl.results.length) {
                  CRM.loadForm(link.url)
                    .on('crmFormSuccess', (e, data) => {
                      ctrl.rowCount = null;
                      ctrl.getResultsPronto();
                    });
                }
              });
            }
          });
        }

        if (this.afFieldset) {
          this.onPostRun.push(function (apiResults) {
            if (apiResults.run.labels && apiResults.run.labels.length && $scope.$parent.addTitle) {
              $scope.$parent.addTitle(apiResults.run.labels.join(' '));
            }
          });
        }
        function setUpWatches() {
          if (ctrl.afFieldset) {
            $scope.$watch(ctrl.afFieldset.getFieldData, onChangeFilters, true);
          }
          if (ctrl.settings.pager && ctrl.settings.pager.expose_limit) {
            $scope.$watch('$ctrl.limit', onChangePageSize);
          }
          $scope.$watch('$ctrl.filters', onChangeFilters, true);
        }
        if ($element.is(':visible')) {
          setUpWatches();
        }
        else {
          let checkVisibility = $interval(() => {
            if ($element.is(':visible')) {
              $interval.cancel(checkVisibility);
              setUpWatches();
            }
          }, 250);
        }
        $timeout(function() {
          if (hasCounter && (!(ctrl.loading || ctrl.results) || !angular.equals({}, ctrl.getAfformFilters()))) {
            var params = ctrl.getApiParams('row_count');
            params.filters = ctrl.filters;
            crmApi4('SearchDisplay', 'run', params).then(function(result) {
              setTotalCount(result.count);
            });
          }
        }, 900);
      },

      hasExtraFirstColumn: function() {
        return this.settings.actions || this.settings.draggable || this.settings.collapsible || this.settings.editableRow || (this.settings.tally && this.settings.tally.label);
      },

      getFilters: function() {
        return _.assign({}, this.getAfformFilters(), this.filters);
      },

      getAfformFilters: function() {
        return _.pick(this.afFieldset ? this.afFieldset.getFieldData() : {}, function(val) {
          return typeof val !== 'undefined' && val !== null && (_.includes(['boolean', 'number', 'object'], typeof val) || val.length);
        });
      },
      getApiParams: function(mode) {
        return {
          return: arguments.length ? mode : 'page:' + this.page,
          savedSearch: this.search,
          display: this.display,
          sort: this.sort,
          limit: this.limit,
          seed: this.seed,
          filters: this.getFilters(),
          afform: this.afFieldset ? this.afFieldset.getFormName() : null
        };
      },

      onClickSearchButton: function() {
        this.rowCount = null;
        this.page = 1;
        this.getResultsPronto();
      },
      runSearch: function(apiCalls, statusParams, editedRow) {
        var ctrl = this,
          requestId = ++this._runCount,
          apiParams = this.getApiParams();
        if (!statusParams) {
          this.loading = true;
        }
        apiCalls = apiCalls || {};
        apiCalls.run = ['SearchDisplay', 'run', apiParams];
        _.each(ctrl.onPreRun, function(callback) {
          callback.call(ctrl, apiCalls);
        });
        const apiRequest = crmApi4(apiCalls);
        apiRequest.then(function(apiResults) {
          if (requestId < ctrl._runCount) {
            return; // Another request started after this one
          }
          ctrl.results = apiResults.run;
          ctrl.loading = false;
          if (!ctrl.rowCount || editedRow) {
            if (!ctrl.limit || (ctrl.results.length < ctrl.limit && ctrl.page === 1)) {
              ctrl.rowCount = ctrl.results.length;
            } else if (ctrl.settings.pager || ctrl.settings.headerCount) {
              var params = ctrl.getApiParams('row_count');
              crmApi4('SearchDisplay', apiCalls.run[1], params).then(function(result) {
                ctrl.rowCount = result.count;
              });
            }
          }
          _.each(ctrl.onPostRun, function(callback) {
            callback.call(ctrl, apiResults, 'success', editedRow);
          });
        }, function(error) {
          if (requestId < ctrl._runCount) {
            return; // Another request started after this one
          }
          ctrl.results = [];
          ctrl.loading = false;
          _.each(ctrl.onPostRun, function(callback) {
            callback.call(ctrl, error, 'error', editedRow);
          });
        });
        if (statusParams) {
          crmStatus(statusParams, apiRequest);
        }
        return apiRequest;
      },

      getFieldClass: function(colIndex, colData) {
        return (colData.cssClass || '') + ' crm-search-col-type-' + this.settings.columns[colIndex].type + (this.settings.columns[colIndex].break ? '' : ' crm-inline-block');
      },

      getFieldTemplate: function(colIndex, colData) {
        let colType = this.settings.columns[colIndex].type;
        if (colType === 'include') {
          return this.settings.columns[colIndex].path;
        }
        if (colType === 'field') {
          if (colData.edit) {
            colType = 'editable';
          } else if (colData.links) {
            colType = 'link';
          }
        }
        return '~/crmSearchDisplay/colType/' + colType + '.html';
      },
    };
  });


  angular.module('crmSearchDisplay').factory('searchDisplayEditableTrait', function(crmApi4, crmStatus) {
    return {

      editing: false,

      onPostRun: [function(apiResults) {
        this.cancelEditing();
      }],

      startEditing: function(row, colIndex) {
        if (this.editing === false && row.columns[colIndex].edit) {
          this.editValues = {};
          this.editing = row.key;
          row.columns.forEach((col, index) => {
            col.editing = (index === colIndex || (this.settings.editableRow && this.settings.editableRow.full));
            col.focused = index === colIndex;
          });
        }
      },

      startCreating: function() {
        this.editing = -1;
        this.editValues = {};
      },

      cancelEditing: function(row) {
        this.editing = false;
        this.editValues = {};
        if (row && row.columns) {
          row.columns.forEach((col) => col.editing = false);
        }
      },

      saveEditing: function(row, colKey) {
        const ctrl = this;
        const apiParams = this.getApiParams(null);
        if (row) {
          if (colKey) {
            const colIndex = this.settings.columns.findIndex(column => column.key === colKey);
            row.columns[colIndex].loading = true;
          } else {
            row.columns.forEach((col) => col.loading = true);
          }
          apiParams.rowKey = row.key;
        }
        apiParams.values = this.editValues;
        this.cancelEditing();

        crmStatus({}, crmApi4('SearchDisplay', 'inlineEdit', apiParams))
          .then(function(result) {
            ctrl.refreshAfterEditing(result, row ? row.key : null);
          });
      },

      refreshAfterEditing: function(result, rowKey) {
        if (!rowKey && result.length) {
          this.results.push(result[0]);
          this.rowCount++;
          return;
        }
        const rowIndex = this.results.findIndex(result => result.key === rowKey);
        if (result.length && rowIndex >= 0) {
          const row = this.results[rowIndex];
          _.defaults(result[0].data, row.data);
          angular.extend(row, result[0]);
        }
        else {
          this.rowCount = null;
          this.getResultsPronto();
          this.$element.trigger('crmPopupFormSuccess');
        }
      }

    };
  });


  angular.module('crmSearchDisplay').factory('searchDisplaySortableTrait', function() {
    var ts = CRM.ts('org.civicrm.search_kit');
    return {

      isSortable: function(col) {
        return !this.settings.draggable && col.type === 'field' && col.sortable !== false;
      },

      getSort: function(col) {
        var dir = _.reduce(this.sort, function(dir, item) {
          return item[0] === col.key ? item[1] : dir;
        }, null);
        if (dir) {
          return 'fa-sort-' + dir.toLowerCase();
        }
        return 'fa-sort disabled';
      },

      setSort: function(col, $event) {
        if (!this.isSortable(col)) {
          return;
        }
        var dir = this.getSort(col) === 'fa-sort-asc' ? 'DESC' : 'ASC';
        if (!$event.shiftKey || !this.sort) {
          this.sort = [];
        }
        var index = _.findIndex(this.sort, [col.key]);
        if (index > -1) {
          this.sort[index][1] = dir;
        } else {
          this.sort.push([col.key, dir]);
        }
        if (this.results || !this.settings.button) {
          this.getResultsPronto();
        }
      }

    };
  });


  angular.module('crmSearchDisplayTable', CRM.angRequires('crmSearchDisplayTable'));



  angular.module('crmSearchDisplayTable').component('crmSearchDisplayTable', {
    bindings: {
      apiEntity: '@',
      search: '<',
      display: '<',
      settings: '<',
      filters: '<',
      totalCount: '=?'
    },
    require: {
      afFieldset: '?^^afFieldset'
    },
    templateUrl: '~/crmSearchDisplayTable/crmSearchDisplayTable.html',
    controller: function($scope, $element, searchDisplayBaseTrait, searchDisplayTasksTrait, searchDisplaySortableTrait, searchDisplayEditableTrait, crmApi4, crmStatus) {
      let ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = angular.extend(this, _.cloneDeep(searchDisplayBaseTrait), _.cloneDeep(searchDisplayTasksTrait), _.cloneDeep(searchDisplaySortableTrait), _.cloneDeep(searchDisplayEditableTrait));

      this.$onInit = function() {
        var tallyParams;
        if (ctrl.settings.tally) {
          ctrl.onPreRun.push(function (apiCalls) {
            ctrl.tally = null;
            tallyParams = _.cloneDeep(apiCalls.run[2]);
          });

          ctrl.onPostRun.push(function (apiResults, status) {
            ctrl.tally = null;
            if (status === 'success' && tallyParams) {
              tallyParams.return = 'tally';
              crmApi4('SearchDisplay', 'run', tallyParams).then(function (result) {
                ctrl.tally = result[0];
              });
            }
          });
        }

        this.initializeDisplay($scope, $element);

        if (ctrl.settings.draggable) {
          ctrl.draggableOptions = {
            containment: $element,
            direction: 'vertical',
            handle: '.crm-draggable',
            forcePlaceholderSize: true,
            helper: function(e, ui) {
              ui.children().each(function() {
                $(this).width($(this).width());
              });
              return ui;
            },
            stop: function(e, ui) {
              const movedItem = ui.item.sortable.model,
                oldPosition = ui.item.sortable.index,
                newPosition = ctrl.results.indexOf(movedItem),
                displacement = newPosition < oldPosition ? -1 : 1,
                displacedItem = ctrl.results[newPosition - displacement];
              if (newPosition > -1 && oldPosition !== newPosition) {
                updateDraggableWeights(movedItem.key, displacedItem.data);
              }
            }
          };
        }
      };

      function updateDraggableWeights(key, data) {
        const weightField = ctrl.settings.draggable;
        const newWeight = data[weightField];
        const apiParams = ctrl.getApiParams('draggableWeight');
        apiParams.rowKey = key;
        apiParams.values = {};
        apiParams.values[weightField] = newWeight;
        crmStatus({}, crmApi4('SearchDisplay', 'inlineEdit', apiParams))
          .then(function(newWeights) {
            const weightColumn = ctrl.settings.columns.findIndex(col => col.key === weightField);
            ctrl.results.forEach(function(row) {
              if (row.key in newWeights) {
                row.data[weightField] = newWeights[row.key];
                if (weightColumn >= 0) {
                  row.columns[weightColumn].val = newWeights[row.key];
                  row.columns[weightColumn] = JSON.parse(angular.toJson(row.columns[weightColumn]));
                }
              }
            });
          });
      }
      this.getHeaderClass = function (column) {
        let headerClasses = [];
        if (ctrl.isSortable(column)) {
          headerClasses.push('crm-sortable-col');
        }
        if (column.alignment) {
          headerClasses.push(column.alignment);
        }
        if (column.cssRules) {
          column.cssRules.forEach(function (cssRule) {
            if (cssRule.length === 1) {
              headerClasses.push(cssRule[0]);
            }
          });
        }
        return headerClasses.join(' ');
      };

      this.getRowClass = function (row) {
        let cssClass = row.cssClass || '';
        if (ctrl.settings.hierarchical) {
          cssClass += ' crm-hierarchical-row crm-hierarchical-depth-' + row.data._depth;
          if (row.data._depth) {
            cssClass += ' crm-hierarchical-child';
          }
          if (row.data._descendents) {
            cssClass += ' crm-hierarchical-parent';
          }
        }
        return cssClass;
      };

    }
  });



  angular.module('crmSearchDisplayTable').component('crmSearchDisplayToggleCollapse', {
    bindings: {
      rows: '<',
      rowIndex: '<',
      defaultCollapsed: '<',
    },
    templateUrl: '~/crmSearchDisplayTable/crmSearchDisplayToggleCollapse.html',
    controller: function($scope, $element) {
      const ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this;

      this.$onInit = function() {
        const row = this.getRow();
        if (!('collapsed' in row)) {
          row.collapsed = row.data._descendents && this.defaultCollapsed === 'closed';
        }
        if (row.collapsed && row.data._descendents) {
          row.collapsed = false;
          this.toggleCollapsed();
        } else {
          row.collapsed = false;
        }
        if (!row.data._descendents) {
          $element.css('visibility', 'hidden');
        }
      };

      this.getRow = function () {
        return this.rows[this.rowIndex];
      };

      this.isCollapsed = function() {
        return this.getRow().collapsed && this.getRow().data._descendents;
      };

      this.countDescendents = function () {
        return this.getRow().data._descendents;
      };

      this.toggleCollapsed = function() {
        const row = this.getRow();
        row.collapsed = !row.collapsed;

        let descendentsEnd = this.rowIndex + row.data._descendents;
        for (let i = this.rowIndex + 1; i <= descendentsEnd; i++) {
          let hide = row.collapsed;
          if (!ctrl.rows[i]) {
            return;
          }
          ctrl.rows[i].hidden = hide;
          if (!hide && ctrl.rows[i].collapsed) {
            i += ctrl.rows[i].data._descendents;
          }
        }
      };

    }
  });


  angular.module('crmSearchTasks', CRM.angRequires('crmSearchTasks'));



  angular.module('crmSearchTasks').component('crmSearchBatchRunner', {
    bindings: {
      entity: '<',
      action: '@',
      ids: '<',
      idField: '@',
      params: '<',
      displayCtrl: '<',
      isLink: '<',
      success: '&',
      error: '&'
    },
    templateUrl: '~/crmSearchTasks/crmSearchBatchRunner.html',
    controller: function($scope, $timeout, $interval, crmApi4) {
      var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this,
        currentBatch = 0,
        totalBatches,
        processedCount = 0,
        countMatched = 0,
        incrementer;

      this.progress = 0;
      const BATCH_SIZE = 500;
      const EST_BATCH_TIME = 5;

      this.$onInit = function() {
        if (ctrl.action === 'create') {
          ctrl.ids = [0];
        }
        totalBatches = Math.ceil(ctrl.ids.length / BATCH_SIZE);
        runBatch();
      };

      this.$onDestroy = function() {
        stopIncrementer();
      };

      function runBatch() {
        let entityName = ctrl.entity;
        let actionName = ctrl.action;
        ctrl.first = currentBatch * BATCH_SIZE;
        ctrl.last = (currentBatch + 1) * BATCH_SIZE;
        if (ctrl.last > ctrl.ids.length) {
          ctrl.last = ctrl.ids.length;
        }
        var params = _.cloneDeep(ctrl.params);
        if (ctrl.action === 'save') {
          params.records = _.transform(ctrl.ids.slice(ctrl.first, ctrl.last), function(records, id) {
            _.each(_.cloneDeep(ctrl.params.records || [{}]), function(record) {
              record[ctrl.idField || 'id'] = id;
              records.push(record);
            });
          });
        } else if (ctrl.isLink && ctrl.action === 'update' && ctrl.ids.length === 1 && ctrl.displayCtrl) {
          entityName = 'SearchDisplay';
          actionName = 'inlineEdit';
          angular.extend(params, ctrl.displayCtrl.getApiParams(null));
          delete params.where;
          params.rowKey = ctrl.ids[0];
        } else if (ctrl.action !== 'create') {
          params.where = params.where || [];
          params.where.push([ctrl.idField || 'id', 'IN', ctrl.ids.slice(ctrl.first, ctrl.last)]);
        }
        crmApi4(entityName, actionName, params).then(
          function(result) {
            stopIncrementer();
            ctrl.progress = Math.floor(100 * ++currentBatch / totalBatches);
            processedCount += result.countFetched;
            countMatched += (result.countMatched || result.count);
            if (ctrl.last >= ctrl.ids.length) {
              $timeout(function() {
                result.batchCount = processedCount;
                result.countMatched = countMatched;
                ctrl.success({result: result});
              }, 500);
            } else {
              runBatch();
            }
          }, function(error) {
            CRM.alert(error.error_message, ts('Error'), 'error');
            ctrl.error();
          });
        incrementer = $interval(function(i) {
          var est = Math.floor(100 * (currentBatch + (i / EST_BATCH_TIME)) / totalBatches);
          ctrl.progress = est > 100 ? 100 : est;
        }, 1000, EST_BATCH_TIME);
      }

      function stopIncrementer() {
        if (angular.isDefined(incrementer)) {
          $interval.cancel(incrementer);
          incrementer = undefined;
        }
      }

    }
  });



  angular.module('crmSearchTasks')
    .directive('crmMultiSelectDate', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {

          var defaultDate = null;

          function getDisplayDate(date) {
            return $.datepicker.formatDate(CRM.config.dateInputFormat, $.datepicker.parseDate('yy-mm-dd', date));
          }

          ngModel.$render = function () {
            element.val(_.isArray(ngModel.$viewValue) ? ngModel.$viewValue.join(',') : ngModel.$viewValue).change();
          };

          element
            .crmSelect2({
              multiple: true,
              data: [],
              initSelection: function(element, callback) {
                var values = [];
                $.each($(element).val().split(','), function(k, v) {
                  values.push({
                    text: getDisplayDate(v),
                    id: v
                  });
                });
                callback(values);
              }
            })
            .on('select2-opening', function(e) {
              var $el = $(this),
                $input = $('.select2-search-field input', $el.select2('container'));
              e.preventDefault();
              if (!$input.data('datepicker')) {
                $input
                  .datepicker({
                    beforeShow: function() {
                      var existingSelections = _.pluck($el.select2('data') || [], 'id');
                      return {
                        changeMonth: true,
                        changeYear: true,
                        defaultDate: defaultDate,
                        beforeShowDay: function(date) {
                          var dateStr = $.datepicker.formatDate('yy-mm-dd', date);
                          if (_.includes(existingSelections, dateStr)) {
                            return [false, '', ''];
                          }
                          return [true, '', ''];
                        }
                      };
                    }
                  })
                  .datepicker('show')
                  .on('change.crmDate', function() {
                    if ($(this).val()) {
                      var data = $el.select2('data') || [];
                      defaultDate = $(this).datepicker('getDate');
                      data.push({
                        text: $.datepicker.formatDate(CRM.config.dateInputFormat, defaultDate),
                        id: $.datepicker.formatDate('yy-mm-dd', defaultDate)
                      });
                      $el.select2('data', data, true);
                    }
                  })
                  .on('keyup', function() {
                    $(this).val('').datepicker('show');
                  });
              }
            })
            .on('select2-removed', function() {
              $('input.hasDatepicker', $(this).select2('container'))
                .datepicker('hide');
            })
            .on('change', function() {
              ngModel.$setViewValue(element.val().split(','));
            });
        }
      };
    });


  angular.module('crmSearchTasks').component('crmSearchInput', {
    bindings: {
      field: '<',
      op: '<',
      format: '<',
      optionKey: '<',
      showLabel: '<',
    },
    require: {ngModel: 'ngModel'},
    templateUrl: '~/crmSearchTasks/crmSearchInput/crmSearchInput.html',
    controller: function($scope) {
      const ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this;

      this.domId = 'search-input-' + Math.random().toString(36).substr(2, 9);

      this.$onInit = function() {

        $scope.$watch('$ctrl.value', function() {
          ctrl.ngModel.$setViewValue(ctrl.value);
        });
        ctrl.ngModel.$parsers.push(function(viewValue) {
          return ctrl.format === 'json' && _.isString(viewValue) && viewValue.length ? JSON.stringify(viewValue) : viewValue;
        });
        ctrl.ngModel.$formatters.push(function(value) {
          return ctrl.format === 'json' && _.isString(value) && value.length ? JSON.parse(value) : value;
        });

        this.ngModel.$render = function() {
          ctrl.value = formatDataType(ctrl.ngModel.$viewValue);
        };

        function formatDataType(val) {
          if (ctrl.optionKey && ctrl.optionKey !== 'id') {
            return val;
          }
          if (ctrl.op && ctrl.op.includes('REGEXP')) {
            return val;
          }
          if (Array.isArray(val)) {
            const formatted = angular.copy(val);
            formatted.forEach((v, i) => formatted[i] = formatDataType(v));
            return formatted;
          }
          if (['Integer', 'Float'].includes(ctrl.field ? ctrl.field.data_type : null)) {
            let newVal = Number(val);
            if ((ctrl.field.name === 'id' || ctrl.field.fk_entity) && ('' + newVal) !== val) {
              return val;
            }
            return newVal;
          }
          return val;
        }

      };
    }
  });

})(angular, CRM.$, CRM._);

(function(angular, $) {
  "use strict";

  angular.module('crmSearchTasks').directive('crmSearchInputFocus', function($timeout) {
    function waitForElement(selector, context = document) {
      return new Promise((resolve) => {
        const observer = new MutationObserver((mutations, observer) => {
          const match = $(selector, context);
          if (match.length) {
            observer.disconnect();
            resolve(match);
          }
        });

        observer.observe(context, {
          childList: true,
          subtree: true,
        });
      });
    }

    return {
      link: function(scope, element, attrs) {
        function getFocusableInput() {
          const types = new Map ([
            ['select2', 'input[crm-ui-select], input[crm-autocomplete]'],
            ['datepicker', 'input[crm-ui-datepicker]'],
            ['boolean', 'input[type="radio"], input[type="checkbox"]'],
            ['default', ':focusable']
          ]);
          for (const [type, selector] of types) {
            const jQueryObject = $(selector, element);
            if (jQueryObject.length > 0 || type === 'default') {
              return [jQueryObject, type];
            }
          }
        }

        function focusOn() {
          let [jQueryObject, type] = getFocusableInput();

          if (type === 'default') {
            jQueryObject.first().trigger('focus');
          }

          else if (type === 'boolean') {
            let checkedItem = $(':checked', element);
            if (checkedItem.length) {
              jQueryObject = checkedItem;
            }
            jQueryObject.first().trigger('focus');
          }

          else if (type === 'select2') {
            waitForElement('.select2-choice', element[0]).then((elements) => {
              $timeout(() => {
                const container = elements.first().closest('.select2-container');
                container.select2('open');
                $(element[0]).one('initSelectionComplete', () => {
                  container.select2('open');
                });
              });
            });
          }

          else if (type === 'datepicker') {
            waitForElement('.hasDatepicker', element[0]).then((elements) => {
              elements.first().datepicker('show');
            });
          }
        }

        scope.$watch(attrs.crmSearchInputFocus, function(flag) {
          if(flag === true) {
            $timeout(focusOn);
          }
        });
      }
    };
  });

})(angular, CRM.$);

(function(angular, $, _) {
  "use strict";

  angular.module('crmSearchTasks').component('crmSearchInputVal', {
    bindings: {
      field: '<',
      'op': '<',
      'optionKey': '<',
      labelId: '@',
    },
    require: {ngModel: 'ngModel'},
    template: '<div class="form-group" ng-include="$ctrl.getTemplate()"></div>',
    controller: function($scope, formatForSelect2, crmApi4) {
      var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this;

      this.$onInit = function() {
        var rendered = false,
          field = this.field || {};
        ctrl.dateRanges = CRM.crmSearchTasks.dateRanges;

        this.ngModel.$render = function() {
          ctrl.value = ctrl.ngModel.$viewValue;
          if (!rendered && isDateField(field)) {
            setDateType();
          }
          rendered = true;
        };

        $scope.$watch('$ctrl.value', function() {
          ctrl.ngModel.$setViewValue(ctrl.value);
        });

        function setDateType() {
          if (_.findWhere(ctrl.dateRanges, {id: ctrl.value})) {
            ctrl.dateType = 'range';
          } else if (ctrl.value === 'now') {
            ctrl.dateType = 'now';
          } else if (_.includes(ctrl.value, 'now -')) {
            ctrl.dateType = 'now -';
          } else if (_.includes(ctrl.value, 'now +')) {
            ctrl.dateType = 'now +';
          } else {
            ctrl.dateType = 'fixed';
          }
        }
      };

      this.getFkEntity = function() {
        return ctrl.field ? ctrl.field.fk_entity || ctrl.field.entity : null;
      };

      var autocompleteStaticOptions = {
        Contact: ['user_contact_id'],
        '': []
      };

      this.getAutocompleteStaticOptions = function() {
        return autocompleteStaticOptions[ctrl.getFkEntity() || ''] || autocompleteStaticOptions[''];
      };

      this.isMulti = function() {
        if (ctrl.op) {
          return ctrl.op === 'IN' || ctrl.op === 'NOT IN' || ctrl.op === 'CONTAINS' || ctrl.op === 'NOT CONTAINS' || ctrl.op === 'CONTAINS ONE OF' || ctrl.op === 'NOT CONTAINS ONE OF';
        }
        return ctrl.field && (ctrl.field.serialize || ctrl.field.data_type === 'Array') ? true : null;
      };

      this.changeDateType = function() {
        switch (ctrl.dateType) {
          case 'fixed':
            ctrl.value = '';
            break;

          case 'range':
            ctrl.value = ctrl.dateRanges[0].id;
            break;

          case 'now':
            ctrl.value = 'now';
            break;

          default:
            ctrl.value = ctrl.dateType + ' 1 day';
        }
      };

      this.dateUnits = function(setUnit) {
        var vals = ctrl.value.split(' ');
        if (arguments.length) {
          vals[3] = setUnit;
          ctrl.value = vals.join(' ');
        } else {
          return vals[3];
        }
      };

      this.dateNumber = function(setNumber) {
        var vals = ctrl.value.split(' ');
        if (arguments.length) {
          vals[2] = setNumber;
          ctrl.value = vals.join(' ');
        } else {
          return parseInt(vals[2], 10);
        }
      };

      this.lookupAddress = function() {
        ctrl.value.geo_code_1 = null;
        ctrl.value.geo_code_2 = null;
        if (ctrl.value.address) {
          crmApi4('Address', 'getCoordinates', {
            address: ctrl.value.address
          }).then(function(coordinates) {
            if (coordinates[0]) {
              ctrl.value.geo_code_1 = coordinates[0].geo_code_1;
              ctrl.value.geo_code_2 = coordinates[0].geo_code_2;
            }
          });
        }
      };

      this.getTemplate = function() {
        var field = ctrl.field || {};

        if (_.includes(['LIKE', 'NOT LIKE', 'REGEXP', 'NOT REGEXP', 'REGEXP BINARY', 'NOT REGEXP BINARY'], ctrl.op)) {
          return '~/crmSearchTasks/crmSearchInput/text.html';
        }

        if (field.input_type === 'Location') {
          ctrl.value = ctrl.value || {distance_unit: CRM.crmSearchAdmin.defaultDistanceUnit};
          return '~/crmSearchTasks/crmSearchInput/location.html';
        }

        if (isDateField(field)) {
          return '~/crmSearchTasks/crmSearchInput/date.html';
        }

        if (field.data_type === 'Boolean') {
          return '~/crmSearchTasks/crmSearchInput/boolean.html';
        }

        if (!_.includes(['>', '<', '>=', '<='], ctrl.op)) {
          if (field.options && (!field.suffixes || field.suffixes.includes('name'))) {
            return '~/crmSearchTasks/crmSearchInput/select.html';
          }
          if (field.fk_entity || field.name === 'id') {
            return '~/crmSearchTasks/crmSearchInput/entityRef.html';
          }
        }

        if (field.data_type === 'Integer') {
          return '~/crmSearchTasks/crmSearchInput/integer.html';
        }

        if (field.data_type === 'Float') {
          return '~/crmSearchTasks/crmSearchInput/float.html';
        }

        if (field.input_type === 'Email') {
          return '~/crmSearchTasks/crmSearchInput/email.html';
        }

        return '~/crmSearchTasks/crmSearchInput/text.html';
      };

      this.getFieldOptions = function() {
        var field = ctrl.field || {};
        return {results: formatForSelect2(field.options || [], ctrl.optionKey || 'id', 'label', ['description', 'color', 'icon'])};
      };

      function isDateField(field) {
        return field.data_type === 'Date' || field.data_type === 'Timestamp';
      }

    }
  });


  angular.module('crmSearchTasks').controller('crmSearchTaskApiBatch', function($scope, searchTaskBaseTrait) {
    var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
      ctrl = angular.extend(this, $scope.model, searchTaskBaseTrait);

    this.entityTitle = this.getEntityTitle();
    if (!ctrl.apiBatch.confirmMsg && !ctrl.apiBatch.fields) {
      ctrl.start(ctrl.apiBatch.params);
    }

    if (ctrl.apiBatch.fields) {
      ctrl.apiBatch.params = ctrl.apiBatch.params || {};
      ctrl.apiBatch.params.values = ctrl.apiBatch.params.values || {};
      ctrl.apiBatch.fields.forEach((field) => {
        let value = '';
        if ('default_value' in field) {
          value = field.default_value;
        } else if (field.serialize || field.data_type === 'Array') {
          value = [];
        } else if (field.data_type === 'Boolean') {
          value = true;
        } else if (field.options && field.options.length) {
          value = field.options[0].id;
        }
        ctrl.apiBatch.params.values[field.name] = value;
      });
    }

    this.onSuccess = function(result) {
      var entityTitle = this.getEntityTitle(result.batchCount);
      if (result.action === 'inlineEdit') {
        CRM.status(ts('Saved'));
      } else {
        CRM.alert(ts(ctrl.apiBatch.successMsg, {1: result.batchCount, 2: entityTitle}), ts('%1 Complete', {1: ctrl.taskTitle}), 'success');
      }
      this.close(result);
    };

    this.onError = function() {
      CRM.alert(ts(ctrl.apiBatch.errorMsg, {1: ctrl.ids.length, 2: ctrl.entityTitle}), ts('Error'), 'error');
      this.cancel();
    };

  });


  angular.module('crmSearchTasks').controller('crmSearchTaskDownload', function($scope, $http, searchTaskBaseTrait, $timeout, $interval) {
    var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
      ctrl = angular.extend(this, $scope.model, searchTaskBaseTrait);

    this.entityTitle = this.getEntityTitle();
    this.format = 'csv';
    this.progress = null;

    this.download = function() {
      ctrl.progress = 0;
      $('div.ui-dialog').last().find('.ui-dialog-titlebar .ui-button').hide();
      var incrementer = $interval(function() {
        if (ctrl.progress < 90) {
          ctrl.progress += 10;
        }
      }, 1000);
      var apiParams = ctrl.taskManager.getApiParams();
      delete apiParams.return;
      delete apiParams.limit;
      apiParams.filters.id = ctrl.ids || null;
      apiParams.format = ctrl.format;
      var httpConfig = {
        responseType: 'arraybuffer',
        headers: {'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded'}
      };
      $http.post(CRM.url('civicrm/ajax/api4/SearchDisplay/download'), $.param({
        params: JSON.stringify(apiParams)
      }), httpConfig)
        .then(function(response) {
          $interval.cancel(incrementer);
          ctrl.progress = 100;
          var blob = new Blob([response.data], {
            type: response.headers('Content-Type')
          }),
            a = document.createElement("a"),
            url = a.href = window.URL.createObjectURL(blob),
            fileName = getFileNameFromHeader(response.headers('Content-Disposition'));
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          $timeout(function() {
            CRM.alert(ts('%1 has been downloaded to your computer.', {1: fileName}), ts('Download Complete'), 'success');
            ctrl.cancel();
          }, 1000);
        });
    };
    function getFileNameFromHeader(contentDisposition) {
      var utf8FilenameRegex = /filename\*=utf-8''([\w%\-\.]+)(?:; ?|$)/i,
        asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/;

      if (contentDisposition && contentDisposition.length) {
        if (utf8FilenameRegex.test(contentDisposition)) {
          return decodeURIComponent(utf8FilenameRegex.exec(contentDisposition)[1]);
        } else {
          var matches = asciiFilenameRegex.exec(contentDisposition);
          if (matches != null && matches[2]) {
            return matches[2];
          }
        }
      }
      return ctrl.entityTitle + '.' + ctrl.format;
    }

  });


  angular.module('crmSearchTasks').controller('crmSearchTaskMailing', function($scope, crmApi4, searchTaskBaseTrait, formatForSelect2) {
    var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
      ctrl = angular.extend(this, $scope.model, searchTaskBaseTrait),
      mailingId;

    this.mailing = {
      name: '',
      template_type: null,
    };
    this.entityTitle = this.getEntityTitle();
    crmApi4({
      templateTypes: ['Mailing', 'getFields', {
        loadOptions: ['id', 'label', 'description'],
        where: [['name', '=', 'template_type']]
      }, ['options']],
      recipientCount: ['Contact', 'get', {
        select: ['row_count'],
        join: [['Email AS email', 'INNER', ['id', '=', 'email.contact_id']]],
        where: [['id', 'IN', ctrl.ids], ['do_not_email', '!=', true], ['is_opt_out', '!=', true], ['email.on_hold', '=', 0]],
        groupBy: ['id']
      }]
    }).then(function(results) {
      ctrl.templateTypes = formatForSelect2(results.templateTypes[0], 'id', 'label', ['description']);
      ctrl.mailing.template_type = ctrl.templateTypes[0].id;
      ctrl.recipientCount = results.recipientCount.count;
    });

    this.submit = function() {
      ctrl.start({
        values: {
          title: 'Hidden Group ' + Date.now(),
          is_hidden: true,
          'group_type:name': ['Mailing List'],
        },
        chain: {
          mailing: ['Mailing', 'create', {
            values: ctrl.mailing,
          }, 0],
          mailingGroup: ['MailingGroup', 'create', {
            values: {
              group_type: 'Include',
              'entity_table:name': 'Group',
              entity_id: '$id',
              mailing_id: '$mailing.id'
            },
          }, 0]
        }
      });
    };
    this.afterGroupCreate = function(result) {
      mailingId = result[0].mailing.id;
      ctrl.addContacts = {
        defaults: {group_id: result[0].id}
      };
    };

    this.onSuccess = function(result) {
      window.location = CRM.url('civicrm/a#/mailing/' + mailingId);
    };

    this.onError = function() {
      CRM.alert(ts('An error occurred while attempting to create mailing.'), ts('Error'), 'error');
      this.cancel();
    };

  });


  angular.module('crmSearchTasks').controller('crmSearchTaskTag', function($scope, crmApi4, searchTaskBaseTrait) {
    const ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
      ctrl = angular.extend(this, $scope.model, searchTaskBaseTrait);

    this.entityTitle = this.getEntityTitle();
    this.action = 'save';
    this.selection = [];
    this.selectedTags = [];
    this.selectedTagsetTags = {};

    crmApi4({
      tags: ['Tag', 'get', {
        select: ['id', 'label', 'color', 'description', 'is_selectable', 'parent_id'],
        where: [
          ['is_tagset', '=', false],
          ['used_for:name', 'CONTAINS', this.entity],
          ['OR', [['parent_id', 'IS NULL'], ['parent_id.is_tagset', '=', false]]]
        ],
        orderBy: {label: 'ASC'}
      }],
      tagsets: ['Tag', 'get', {
        select: ['id', 'name', 'label'],
        where: [['is_tagset', '=', true], ['used_for:name', 'CONTAINS', this.entity]]
      }],
    }).then(function(result) {
      ctrl.tagsets = result.tagsets;
      ctrl.tags = sortTagsForSelect2(result.tags);
    });
    function sortTagsForSelect2(rawTags) {
      const sorted = rawTags.reduce((accum, tag) => {
        accum[tag.id] = {
          id: tag.id,
          text: tag.label,
          description: tag.description,
          color: tag.color,
          disabled: !tag.is_selectable,
          parent_id: tag.parent_id
        };
        return accum;
      }, {});
      Object.values(sorted).forEach(tag => {
        if (tag.parent_id && sorted[tag.parent_id]) {
          sorted[tag.parent_id].children = sorted[tag.parent_id].children || [];
          sorted[tag.parent_id].children.push(tag);
        }
      });
      return Object.values(sorted).filter(tag => tag.parent_id === null);
    }

    this.saveTags = function() {
      const params = {};
      if (ctrl.action === 'save') {
        params.defaults = {
          'entity_table:name': ctrl.entity
        };
        params.records = ctrl.selection.map(tagId => {
          return {tag_id: tagId};
        });
        params.match = ['entity_id', 'tag_id', 'entity_table'];
      }
      else {
        params.where = [
          ['entity_table:name', '=', ctrl.entity],
          ['tag_id', 'IN', ctrl.selection]
        ];
      }
      ctrl.start(params);
    };

    this.onSelectTags = function() {
      ctrl.selection = [...ctrl.selectedTags];
      Object.values(ctrl.selectedTagsetTags).forEach(set => {
        ctrl.selection = [...ctrl.selection, ...set];
      });
    };

    this.onSuccess = function(result) {
      let msg;
      if (ctrl.action === 'delete') {
        msg = result.batchCount === 1 ? ts('1 tag removed.') : ts('%1 tags removed.', {1: result.batchCount});
        CRM.alert(msg, ts('Saved'), 'success');
      } else {
        const added = result.batchCount - result.countMatched;
        msg = added === 1 ? ts('1 tag added') : ts('%1 tags added.', {1: added});
        msg += '<br/>';
        if (result.countMatched > 0) {
          msg += result.countMatched === 1 ? ts('1 tag already exists and was not added.') : ts('%1 tags already exist and were not added.', {1: result.countMatched});
        }
        CRM.alert(msg, ts('Saved'), 'success');
      }
      this.close();
    };

    this.onError = function() {
      CRM.alert(ts('An error occurred while updating tags.'), ts('Error'), 'error');
      this.cancel();
    };

  });


  angular.module('crmSearchTasks').controller('crmSearchTaskUpdate', function ($scope, $timeout, crmApi4, searchTaskBaseTrait) {
    var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
      ctrl = angular.extend(this, $scope.model, searchTaskBaseTrait);

    this.entityTitle = this.getEntityTitle();
    this.values = [];
    this.add = null;
    this.fields = null;

    crmApi4({
      getFields: [this.entity, 'getFields', {
        action: 'update',
        select: ['name', 'label', 'description', 'input_type', 'data_type', 'serialize', 'options', 'fk_entity', 'nullable'],
        loadOptions: ['id', 'name', 'label', 'description', 'color', 'icon'],
        where: [['deprecated', '=', false], ["readonly", "=", false]],
      }],
    }).then(function(results) {
        ctrl.fields = results.getFields;
      });

    this.updateField = function(index) {
      $timeout(function() {
        if (!ctrl.values[index][0]) {
          ctrl.values.splice(index, 1);
        }
      });
    };

    this.addField = function() {
      $timeout(function() {
        if (ctrl.add) {
          var field = ctrl.getField(ctrl.add),
            value = '';
          if (field.serialize || field.data_type === 'Array') {
            value = [];
          } else if (field.data_type === 'Boolean') {
            value = true;
          } else if (field.options && field.options.length) {
            value = field.options[0].id;
          }
          ctrl.values.push([ctrl.add, value]);
        }
        ctrl.add = null;
      });
    };

    this.getField = function(fieldName) {
      return _.where(ctrl.fields, {name: fieldName})[0];
    };

    function fieldInUse(fieldName) {
      return _.includes(_.collect(ctrl.values, 0), fieldName);
    }

    this.availableFields = function() {
      var results = _.transform(ctrl.fields, function(result, item) {
        var formatted = {id: item.name, text: item.label, description: item.description};
        if (fieldInUse(item.name)) {
          formatted.disabled = true;
        }
        result.push(formatted);
      }, []);
      return {results: results};
    };

    this.save = function() {
      ctrl.start({
        values: _.zipObject(ctrl.values)
      });
    };

    this.onSuccess = function() {
      CRM.alert(ts('Successfully updated %1 %2.', {1: ctrl.ids.length, 2: ctrl.entityTitle}), ts('Saved'), 'success');
      this.close();
    };

    this.onError = function() {
      CRM.alert(ts('An error occurred while attempting to update %1 %2.', {1: ctrl.ids.length, 2: ctrl.entityTitle}), ts('Error'), 'error');
      this.cancel();
    };

  });


  angular.module('crmSearchTasks').component('crmSearchTasksMenu', {
    bindings: {
      taskManager: '<',
      displayMode: '<',
      ids: '<'
    },
    template: '<div class="btn-group" ng-include="\'~/crmSearchTasks/crmSearchTasks-\'+$ctrl.displayMode+\'.html\'"></div>',
    controller: function($scope) {
      var ts = $scope.ts = CRM.ts('org.civicrm.search_kit'),
        ctrl = this;

      this.$onInit = function() {
        var unwatchIDs = $scope.$watch('$ctrl.ids.length', function (idsLength) {
          if (idsLength) {
            unwatchIDs();
            ctrl.taskManager.getMetadata();
          }
        });
      };

      this.isActionAllowed = function(action) {
        return $scope.$eval('' + ctrl.ids.length + action.number);
      };

      this.getActionTitle = function(action) {
        if (ctrl.isActionAllowed(action)) {
          return ctrl.ids.length ?
            ts('Perform action on %1 %2', {1: ctrl.ids.length, 2: ctrl.taskManager.entityInfo[ctrl.ids.length === 1 ? 'title' : 'title_plural']}) :
            ts('Perform action on all %1', {1: ctrl.taskManager.entityInfo.title_plural});
        }
        return ts('Selected number must be %1', {1: action.number.replace('===', '')});
      };

      this.doAction = function(action) {
        if (!ctrl.isActionAllowed(action)) {
          return;
        }
        ctrl.taskManager.doTask(action, ctrl.ids);
      };
    }
  });


  angular.module('crmSearchTasks').factory('searchDisplayTasksTrait', function($rootScope, $window, crmApi4, dialogService) {
    var ts = CRM.ts('org.civicrm.search_kit');
    function TaskManager(displayCtrl, $element) {
      var mngr = this;
      var fetchedMetadata;
      this.tasks = null;
      this.entityInfo = null;

      this.getMetadata = function() {
        if (!fetchedMetadata) {
          fetchedMetadata = crmApi4({
            entityInfo: ['Entity', 'get', {select: ['name', 'title', 'title_plural', 'primary_key'], where: [['name', '=', mngr.getEntityName()]]}, 0],
            tasks: ['SearchDisplay', 'getSearchTasks', {savedSearch: displayCtrl.search, display: displayCtrl.display}]
          }).then(function(result) {
            mngr.entityInfo = result.entityInfo;
            mngr.tasks = result.tasks;
          }, function(failure) {
            mngr.tasks = [];
            mngr.entityInfo = [];
          });
        }
        return fetchedMetadata;
      };

      this.getEntityName = function() {
        return displayCtrl.apiEntity === 'RelationshipCache' ? 'Relationship' : displayCtrl.apiEntity;
      };
      this.getApiParams = function() {
        return displayCtrl.getApiParams();
      };
      this.getRowCount = function() {
        return displayCtrl.rowCount;
      };
      this.isDisplayReady = function() {
        return !displayCtrl.loading && displayCtrl.results && displayCtrl.results.length;
      };
      this.getTaskInfo = function(taskName) {
        return _.findWhere(mngr.tasks, {name: taskName});
      };

      this.doTask = function(task, ids, isLink) {
        var data = {
          ids: ids,
          entity: mngr.getEntityName(),
          search: displayCtrl.search,
          display: displayCtrl.display,
          displayCtrl: displayCtrl,
          taskManager: mngr,
          entityInfo: mngr.entityInfo,
          taskTitle: task.title,
          isLink: isLink,
          apiBatch: _.cloneDeep(task.apiBatch)
        };
        if (task.crmPopup) {
          var path = $rootScope.$eval(task.crmPopup.path, data),
            query = task.crmPopup.query && $rootScope.$eval(task.crmPopup.query, data);
          CRM.loadForm(CRM.url(path, query, 'back'), {post: task.crmPopup.data && $rootScope.$eval(task.crmPopup.data, data)})
            .on('crmFormSuccess', (e) => {
                e.stopPropagation();
                mngr.refreshAfterTask();
            });
        }
        else if (task.redirect) {
          var redirectPath = $rootScope.$eval(task.redirect.path, data),
            redirectQuery = task.redirect.query && $rootScope.$eval(task.redirect.query, data) && $rootScope.$eval(task.redirect.data, data);
          $window.open(CRM.url(redirectPath, redirectQuery, 'back'), '_blank');
        }
        else {
          var options = CRM.utils.adjustDialogDefaults({
            autoOpen: false,
            dialogClass: 'crm-search-task-dialog',
            title: task.title
          });
          dialogService.open('crmSearchTask', (task.uiDialog && task.uiDialog.templateUrl) || '~/crmSearchTasks/crmSearchTaskApiBatch.html', data, options)
            .then((result) => mngr.refreshAfterTask(result, ids), _.noop);
        }
      };

      this.refreshAfterTask = function(result, ids) {
        displayCtrl.selectedRows = [];
        displayCtrl.allRowsSelected = false;
        if (ids && result.action === 'inlineEdit' && ids.length === 1) {
          displayCtrl.refreshAfterEditing(result, ids[0]);
        }
        else {
          displayCtrl.rowCount = null;
          displayCtrl.getResultsPronto();
          $element.trigger('crmPopupFormSuccess');
        }
      };
    }
    return {
      selectAllPages: function() {
        var ctrl = this;
        ctrl.loadingAllRows = ctrl.allRowsSelected = true;
        var params = ctrl.getApiParams('id');
        crmApi4('SearchDisplay', 'run', params).then(function(ids) {
          ctrl.loadingAllRows = false;
          ctrl.selectedRows = _.uniq(_.toArray(ids));
        });
      },
      selectPage: function() {
        this.allRowsSelected = (this.rowCount <= this.results.length);
        this.selectedRows = _.uniq(_.pluck(this.results, 'key'));
      },
      selectNone: function() {
        this.allRowsSelected = false;
        this.selectedRows = [];
      },
      toggleAllRows: function() {
        if (this.selectedRows && this.selectedRows.length) {
          this.selectNone();
        }
        else if (this.page === 1 && this.rowCount === this.results.length) {
          this.selectPage();
        }
        else {
          this.selectAllPages();
        }
      },
      toggleRow: function(row, event) {
        this.selectedRows = this.selectedRows || [];
        var ctrl = this,
          index = ctrl.selectedRows.indexOf(row.key);
        function checkRange(allRows, checkboxPosition, dir) {
          for (var row = checkboxPosition; row >= 0 && row <= allRows.length; row += dir) {
            if (ctrl.selectedRows.indexOf(allRows[row]) > -1) {
              return row;
            }
          }
        }
        function selectRange(allRows, start, end) {
          for (var row = start; row <= end; ++row) {
            ctrl.selectedRows.push(allRows[row]);
          }
        }

        if (index < 0) {
          if (event.shiftKey && ctrl.selectedRows.length) {
            var allRows = _.pluck(ctrl.results, 'key'),
              checkboxPosition = allRows.indexOf(row.key);

            var nearestBefore = checkRange(allRows, checkboxPosition, -1),
              nearestAfter = checkRange(allRows, checkboxPosition, 1);
            if (nearestAfter !== undefined && (nearestBefore === undefined || nearestAfter === allRows.indexOf(_.last(ctrl.selectedRows)))) {
              selectRange(allRows, checkboxPosition + 1, nearestAfter - 1);
            } else if (nearestBefore !== undefined && (nearestAfter === undefined || nearestBefore === allRows.indexOf(_.last(ctrl.selectedRows)))) {
              selectRange(allRows, nearestBefore + 1, checkboxPosition -1);
            }
          }
          ctrl.selectedRows = _.uniq(ctrl.selectedRows.concat([row.key]));
          ctrl.allRowsSelected = (ctrl.rowCount === ctrl.selectedRows.length);
        } else {
          ctrl.allRowsSelected = false;
          ctrl.selectedRows.splice(index, 1);
        }
      },
      isRowSelected: function(row) {
        return this.allRowsSelected || _.includes(this.selectedRows, row.key);
      },

      isPageSelected: function() {
        return (this.allRowsSelected && this.rowCount === this.results.length) ||
          (!this.allRowsSelected && this.selectedRows && this.selectedRows.length === this.results.length);
      },
      onClickLink: function(link, id, event) {
        if (link.task) {
          const mngr = this.taskManager;
          event.preventDefault();
          mngr.getMetadata().then(function() {
            mngr.doTask(_.extend({title: link.title}, mngr.getTaskInfo(link.task)), [id], true);
          });
        }
      },
      onInitialize: [function($scope, $element) {
        if (!this.taskManager) {
          this.taskManager = new TaskManager(this, $element);
        }
      }],
      onChangeFilters: [function() {
        this.selectedRows = [];
        this.allRowsSelected = false;
      }],
      onPostRun: [function(apiResults, status, editedRow) {
        if (editedRow && status === 'success' && this.selectedRows) {
          var index = this.selectedRows.indexOf(editedRow.key);
          if (index > -1 && !_.findWhere(apiResults.run, {key: editedRow.key})) {
            this.selectedRows.splice(index, 1);
          }
        }
        else if (status === 'success' && !editedRow && apiResults.run && apiResults.run[0]) {
          const mngr = this.taskManager;
          if (this.settings.actions_display_mode === 'buttons') {
            mngr.getMetadata();
            return;
          }
          _.each(apiResults.run[0].columns, function(column) {
            if ((column.link && column.link.task) || _.find(column.links || [], 'task')) {
              mngr.getMetadata();
            }
          });
        }
      }]

    };
  });


  angular.module('crmSearchTasks').factory('searchTaskBaseTrait', function(dialogService) {
    var ts = CRM.ts('org.civicrm.search_kit');
    return {

      getEntityTitle: function(count) {
        if (typeof count !== 'number') {
          count = this.ids.length;
        }
        return count === 1 ? this.entityInfo.title : this.entityInfo.title_plural;
      },

      start: function(runParams) {
        $('.ui-dialog-titlebar button').hide();
        this.run = runParams || {};
      },

      cancel: function() {
        dialogService.cancel('crmSearchTask');
      },

      close: function(result) {
        dialogService.close('crmSearchTask', result);
      }

    };
  });


var uidCount = 0,
    pageTitleHTML = 'CiviCRM',
    documentTitle = 'CiviCRM';

  angular.module('crmUi', CRM.angRequires('crmUi'))
    .directive('crmUiAccordion', function() {
      return {
        scope: {
          crmUiAccordion: '='
        },
        template: '<details class="crm-accordion-bold"><summary>{{crmUiAccordion.title}} <a crm-ui-help="help" ng-if="help"></a></summary><div class="crm-accordion-body" ng-transclude></div></details>',
        transclude: true,
        link: function (scope, element, attrs) {
          scope.help = null;
          let openSet = false;
          scope.$watch('crmUiAccordion', function(crmUiAccordion, oldVal) {
            if (crmUiAccordion) {
              if (!openSet) {
                $(element).children('details').prop('open', !crmUiAccordion.collapsed);
                openSet = true;
              }
              if (crmUiAccordion.help) {
                scope.help = crmUiAccordion.help.clone({}, {
                  title: crmUiAccordion.title
                });
              }
            }
          });
        }
      };
    })
    .service('crmUiAlert', function($compile, $rootScope, $templateRequest, $q) {
      var count = 0;
      return function crmUiAlert(params) {
        var id = 'crmUiAlert_' + (++count);
        var tpl = null;
        if (params.templateUrl) {
          tpl = $templateRequest(params.templateUrl);
        }
        else if (params.template) {
          tpl = params.template;
        }
        if (tpl) {
          params.text = '<div id="' + id + '"></div>'; // temporary stub
        }
        var result = CRM.alert(params.text, params.title, params.type, params.options);
        if (tpl) {
          $q.when(tpl, function(html) {
            var scope = params.scope || $rootScope.$new();
            var linker = $compile(html);
            $('#' + id).append($(linker(scope)));
          });
        }
        return result;
      };
    })
    .directive('crmUiDatepicker', function ($timeout) {
      return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
          crmUiDatepicker: '='
        },
        link: function (scope, element, attrs, ngModel) {
          ngModel.$render = function () {
            element.val(ngModel.$viewValue).change();
          };
          let settings = angular.copy(scope.crmUiDatepicker || {});
          settings.start_date_years = settings.start_date_years || 100;
          settings.end_date_years = settings.end_date_years || 100;
          $timeout(function() {
            element
              .crmDatepicker(settings)
              .on('change', function () {
                $timeout(function() {
                  let requiredLength = 19;
                  if (settings.time === false) {
                    requiredLength = 10;
                  }
                  if (settings.date === false) {
                    requiredLength = 8;
                  }
                  ngModel.$setValidity('incompleteDateTime', !(element.val().length && element.val().length !== requiredLength));
                });
              });
          });
        }
      };
    })
    .directive('crmUiDebug', function ($location) {
      return {
        restrict: 'AE',
        scope: {
          crmUiDebug: '@'
        },
        template: function() {
          var args = $location.search();
          if (args && args.angularDebug) {
            var jsonTpl = (CRM.angular.modules.indexOf('jsonFormatter') < 0) ? '<pre>{{data|json}}</pre>' : '<json-formatter json="data" open="1"></json-formatter>';
            return '<div crm-ui-accordion=\'{title: ts("Debug (%1)", {1: crmUiDebug}), collapsed: true}\'>' + jsonTpl + '</div>';
          }
          return '';
        },
        link: function(scope, element, attrs) {
          var args = $location.search();
          if (args && args.angularDebug) {
            scope.ts = CRM.ts(null);
            scope.$parent.$watch(attrs.crmUiDebug, function(data) {
              scope.data = data;
            });
          }
        }
      };
    })
    .directive('crmUiField', function() {
      var templateUrls = {
        default: '~/crmUi/field.html',
        checkbox: '~/crmUi/field-cb.html'
      };

      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        scope: {
          crmUiField: '='
        },
        templateUrl: function(tElement, tAttrs){
          var layout = tAttrs.crmLayout ? tAttrs.crmLayout : 'default';
          return templateUrls[layout];
        },
        transclude: true,
        link: function (scope, element, attrs, crmUiIdCtrl) {
          $(element).addClass('crm-section');
          scope.help = null;
          scope.$watch('crmUiField', function(crmUiField) {
            if (crmUiField && crmUiField.help) {
              scope.help = crmUiField.help.clone({}, {
                title: crmUiField.title
              });
            }
          });
        }
      };
    })
    .directive('crmUiId', function () {
      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        link: {
          pre: function (scope, element, attrs, crmUiIdCtrl) {
            var id = crmUiIdCtrl.get(attrs.crmUiId);
            element.attr('id', id);
          }
        }
      };
    })
    .service('crmUiHelp', function(){
      function FieldHelp(options) {
        this.options = options;
      }
      angular.extend(FieldHelp.prototype, {
        get: function(n) {
          return this.options[n];
        },
        open: function open() {
          CRM.help(this.options.title, {id: this.options.id, file: this.options.file});
        },
        clone: function clone(options, defaults) {
          return new FieldHelp(angular.extend({}, defaults, this.options, options));
        }
      });
      return function(defaults){
        return function(options) {
          if (_.isString(options)) {
            options = {id: options};
          }
          return new FieldHelp(angular.extend({}, defaults, options));
        };
      };
    })
    .directive('crmUiHelp', function() {
      return {
        restrict: 'EA',
        link: function(scope, element, attrs) {
          setTimeout(function() {
            var crmUiHelp = scope.$eval(attrs.crmUiHelp);
            var title = crmUiHelp && crmUiHelp.get('title') ? ts('%1 Help', {1: crmUiHelp.get('title')}) : ts('Help');
            element.attr('title', title);
          }, 50);

          element
            .addClass('helpicon')
            .attr('href', '#')
            .on('click', function(e) {
              e.preventDefault();
              scope.$eval(attrs.crmUiHelp).open();
            });
        }
      };
    })
    .directive('crmUiFor', function ($parse, $timeout) {
      return {
        require: '^crmUiIdScope',
        restrict: 'EA',
        template: '<span ng-class="cssClasses"><span ng-transclude/><span crm-ui-visible="crmIsRequired" class="crm-marker" title="This field is required.">*</span></span>',
        transclude: true,
        link: function (scope, element, attrs, crmUiIdCtrl) {
          scope.crmIsRequired = false;
          scope.cssClasses = {};

          if (!attrs.crmUiFor) return;

          var id = crmUiIdCtrl.get(attrs.crmUiFor);
          element.attr('for', id);
          var ngModel = null;

          var updateCss = function () {
            scope.cssClasses['crm-error'] = !ngModel.$valid && !ngModel.$pristine;
          };
          var init = function (retries, retryDelay) {
            var input = $('#' + id);
            if (input.length === 0 && !attrs.crmUiForceRequired) {
              if (retries) {
                $timeout(function(){
                  init(retries-1, retryDelay);
                }, retryDelay);
              }
              return;
            }

            if (attrs.crmUiForceRequired) {
              scope.crmIsRequired = true;
              return;
            }

            var tgtScope = scope;//.$parent;
            if (attrs.crmDepth) {
              for (var i = attrs.crmDepth; i > 0; i--) {
                tgtScope = tgtScope.$parent;
              }
            }

            if (input.attr('ng-required')) {
              scope.crmIsRequired = scope.$parent.$eval(input.attr('ng-required'));
              scope.$parent.$watch(input.attr('ng-required'), function (isRequired) {
                scope.crmIsRequired = isRequired;
              });
            }
            else {
              scope.crmIsRequired = input.prop('required');
            }

            ngModel = $parse(attrs.crmUiFor)(tgtScope);
            if (ngModel) {
              ngModel.$viewChangeListeners.push(updateCss);
            }
          };

          $timeout(function(){
            init(3, 100);
          });
        }
      };
    })
    .directive('crmUiIdScope', function () {
      return {
        restrict: 'EA',
        scope: {},
        controllerAs: 'crmUiIdCtrl',
        controller: function($scope) {
          var ids = {};
          this.get = function(name) {
            if (!ids[name]) {
              ids[name] = "crmUiId_" + (++uidCount);
            }
            return ids[name];
          };
        },
        link: function (scope, element, attrs) {}
      };
    })
    .directive('crmUiIframe', function ($parse) {
      return {
        scope: {
          crmUiIframeSrc: '@', // expression which evaluates to a URL
          crmUiIframe: '@' // expression which evaluates to HTML content
        },
        link: function (scope, elm, attrs) {
          var iframe = $(elm)[0];
          iframe.setAttribute('width', '100%');
          iframe.setAttribute('height', '250px');
          iframe.setAttribute('frameborder', '0');

          var refresh = function () {
            if (attrs.crmUiIframeSrc) {
              iframe.setAttribute('src', scope.$parent.$eval(attrs.crmUiIframeSrc));
            }
            else {
              var iframeHtml = scope.$parent.$eval(attrs.crmUiIframe);

              var doc = iframe.document;
              if (iframe.contentDocument) {
                doc = iframe.contentDocument;
              }
              else if (iframe.contentWindow) {
                doc = iframe.contentWindow.document;
              }

              doc.open();
              doc.writeln(iframeHtml);
              doc.close();
            }
          };
          $(elm).parent().on('dialogresize dialogopen', function(e, ui) {
            $(this).css({padding: '0', margin: '0', overflow: 'hidden'});
            iframe.setAttribute('height', '' + $(this).innerHeight() + 'px');
          });

          $(elm).parent().on('dialogresize', function(e, ui) {
            iframe.setAttribute('class', 'resized');
          });

          scope.$parent.$watch(attrs.crmUiIframe, refresh);
        }
      };
    })
    .directive('crmUiInsertRx', function() {
      return {
        link: function(scope, element, attrs) {
          scope.$on(attrs.crmUiInsertRx, function(e, tokenName) {
            CRM.wysiwyg.insert(element, tokenName);
            $(element).select2('close').select2('val', '');
            CRM.wysiwyg.focus(element);
          });
        }
      };
    })
    .directive('crmUiRichtext', function ($timeout) {
      return {
        require: '?ngModel',
        link: function (scope, elm, attr, ngModel) {
          $timeout(function() {
            var editor = CRM.wysiwyg.create(elm);

            if (!ngModel) {
              return;
            }

            if (attr.ngBlur) {
              $(elm).on('blur', function() {
                $timeout(function() {
                  scope.$eval(attr.ngBlur);
                });
              });
            }

            ngModel.$render = function(value) {
              editor.done(function() {
                CRM.wysiwyg.setVal(elm, ngModel.$viewValue || '');
              });
            };
          });
        }
      };
    })
    .directive('crmUiLock', function ($parse, $rootScope) {
      var defaultVal = function (defaultValue) {
        var f = function (scope) {
          return defaultValue;
        };
        f.assign = function (scope, value) {
        };
        return f;
      };
      var parse = function (expr, defaultValue) {
        return expr ? $parse(expr) : defaultVal(defaultValue);
      };

      return {
        template: '',
        link: function (scope, element, attrs) {
          var binding = parse(attrs.binding, true);
          var titleLocked = parse(attrs.titleLocked, ts('Locked'));
          var titleUnlocked = parse(attrs.titleUnlocked, ts('Unlocked'));

          $(element).addClass('crm-i lock-button');
          var refresh = function () {
            var locked = binding(scope);
            if (locked) {
              $(element)
                .removeClass('fa-unlock')
                .addClass('fa-lock')
                .prop('title', titleLocked(scope))
              ;
            }
            else {
              $(element)
                .removeClass('fa-lock')
                .addClass('fa-unlock')
                .prop('title', titleUnlocked(scope))
              ;
            }
          };

          $(element).click(function () {
            binding.assign(scope, !binding(scope));
            $rootScope.$digest();
          });

          scope.$watch(attrs.binding, refresh);
          scope.$watch(attrs.titleLocked, refresh);
          scope.$watch(attrs.titleUnlocked, refresh);

          refresh();
        }
      };
    })
    .service('CrmUiOrderCtrl', function(){
      function CrmUiOrderCtrl(defaults){
        this.values = defaults;
      }
      angular.extend(CrmUiOrderCtrl.prototype, {
        get: function get() {
          return this.values;
        },
        getDir: function getDir(name) {
          if (this.values.indexOf(name) >= 0 || this.values.indexOf('+' + name) >= 0) {
            return '+';
          }
          if (this.values.indexOf('-' + name) >= 0) {
            return '-';
          }
          return '';
        },
        remove: function remove(name) {
          var idx = this.values.indexOf(name);
          if (idx >= 0) {
            this.values.splice(idx, 1);
            return true;
          }
          else {
            return false;
          }
        },
        setDir: function setDir(name, dir) {
          return this.toggle(name, dir);
        },
        toggle: function toggle(name, next) {
          if (!next && next !== '') {
            next = '+';
            if (this.remove(name) || this.remove('+' + name)) {
              next = '-';
            }
            if (this.remove('-' + name)) {
              next = '';
            }
          }

          if (next == '+') {
            this.values.unshift('+' + name);
          }
          else if (next == '-') {
            this.values.unshift('-' + name);
          }
        }
      });
      return CrmUiOrderCtrl;
    })
    .directive('crmUiOrder', function(CrmUiOrderCtrl) {
      return {
        link: function(scope, element, attrs){
          var options = angular.extend({var: 'crmUiOrderBy'}, scope.$eval(attrs.crmUiOrder));
          scope[options.var] = new CrmUiOrderCtrl(options.defaults);
        }
      };
    })
    .directive('crmUiOrderBy', function() {
      return {
        link: function(scope, element, attrs) {
          function updateClass(crmUiOrderCtrl, name) {
            var dir = crmUiOrderCtrl.getDir(name);
            element
              .toggleClass('sorting_asc', dir === '+')
              .toggleClass('sorting_desc', dir === '-')
              .toggleClass('sorting', dir === '');
          }

          element.on('click', function(e){
            var tgt = scope.$eval(attrs.crmUiOrderBy);
            tgt[0].toggle(tgt[1]);
            updateClass(tgt[0], tgt[1]);
            e.preventDefault();
            scope.$digest();
          });

          var tgt = scope.$eval(attrs.crmUiOrderBy);
          updateClass(tgt[0], tgt[1]);
        }
      };
    })
    .directive('crmUiSelect', function ($parse, $timeout) {
      return {
        require: '?ngModel',
        priority: 1,
        scope: {
          crmUiSelect: '='
        },
        link: function (scope, element, attrs, ngModel) {

          if (ngModel && !attrs.ngOptions) {
            ngModel.$render = function () {
              $timeout(function () {
                var newVal = _.cloneDeep(ngModel.$modelValue);
                if (typeof newVal === 'string' && element.select2('container').hasClass('select2-container-multi')) {
                  newVal = newVal.length ? newVal.split(scope.crmUiSelect.separator || ',') : [];
                }
                element.select2('val', newVal);
              });
            };
          }
          function refreshModel() {
            var oldValue = ngModel.$viewValue, newValue = element.select2('val');
            if (Array.isArray(newValue) && attrs.ngList) {
              newValue = newValue.join(attrs.ngList);
            }
            if (oldValue != newValue) {
              scope.$parent.$apply(function () {
                ngModel.$setViewValue(newValue);
              });
            }
          }

          function init() {
            element.crmSelect2(scope.crmUiSelect || {});
            if (ngModel) {
              element.on('change', refreshModel);
            }
          }
          if (attrs.ngOptions) {
            $timeout(function() {
              element.crmSelect2(scope.crmUiSelect || {});
              ngModel.$render = function () {
                element.val(ngModel.$viewValue || '').change();
              };
            });
          } else {
            $timeout(init);
          }
        }
      };
    })
    .directive('onCrmUiSelect', function () {
      return {
        priority: 10,
        link: function (scope, element, attrs) {
          element.on('select2-selecting', function(e) {
            e.preventDefault();
            element.select2('close').select2('val', '');
            scope.$apply(function() {
              scope.$eval(attrs.onCrmUiSelect, {selection: e.val});
            });
          });
        }
      };
    })
    .directive('crmEntityref', function ($parse, $timeout) {
      return {
        require: '?ngModel',
        scope: {
          crmEntityref: '='
        },
        link: function (scope, element, attrs, ngModel) {

          ngModel.$render = function () {
            $timeout(function () {
              var newVal = _.cloneDeep(ngModel.$modelValue);
              if (typeof newVal === 'string' && element.select2('container').hasClass('select2-container-multi')) {
                newVal = newVal.length ? newVal.split(',') : [];
              }
              element.select2('val', newVal);
            });
          };
          function refreshModel() {
            var oldValue = ngModel.$viewValue, newValue = element.select2('val');
            if (oldValue != newValue) {
              scope.$parent.$apply(function () {
                ngModel.$setViewValue(newValue);
              });
            }
          }

          function init() {
            element.crmEntityRef(scope.crmEntityref || {});
            element.on('change', refreshModel);
            $timeout(ngModel.$render);
          }

          init();
        }
      };
    })
    .directive('crmAutocomplete', function () {
      return {
        require: {
          crmAutocomplete: 'crmAutocomplete',
          ngModel: '?ngModel'
        },
        priority: 100,
        bindToController: {
          entity: '<crmAutocomplete',
          crmAutocompleteParams: '<',
          multi: '<',
          autoOpen: '<',
          quickAdd: '<',
          staticOptions: '<'
        },
        link: function(scope, element, attr, ctrl) {
          var parseList = function(viewValue) {
            if (_.isUndefined(viewValue)) return;

            if (!ctrl.crmAutocomplete.multi) {
              return viewValue;
            }

            var list = [];

            if (viewValue) {
              _.each(viewValue.split(','), function(value) {
                if (value) {
                  list.push(_.trim(value));
                }
              });
            }

            return list;
          };

          if (ctrl.ngModel) {
            ctrl.ngModel.$render = function() {
              const newValue = (ctrl.ngModel.$viewValue === null || ctrl.ngModel.$viewValue === undefined || ctrl.ngModel.$viewValue === false) ? '' : ctrl.ngModel.$viewValue.toString();
              if (newValue !== element.val().toString()) {
                element.val(newValue).change();
              }
            };
            ctrl.ngModel.$parsers.push(parseList);
            ctrl.ngModel.$formatters.push(function(value) {
              return _.isArray(value) ? value.join(',') : value;
            });
            ctrl.ngModel.$isEmpty = function(value) {
              return !value || !value.length;
            };
          }
        },
        controller: function($element, $timeout) {
          var ctrl = this;
          this.$onChanges = function() {
            $timeout(function() {
              $element.crmAutocomplete(ctrl.entity, ctrl.crmAutocompleteParams || {}, {
                multiple: ctrl.multi,
                minimumInputLength: ctrl.autoOpen && _.isEmpty(ctrl.staticOptions) ? 0 : 1,
                static: ctrl.staticOptions || [],
                quickAdd: ctrl.quickAdd,
              });
            });
          };
        }
      };
    })
    .directive('crmMultipleEmail', function ($parse, $timeout) {
      return {
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
          ctrl.$parsers.unshift(function(viewValue) {
            if (_.isEmpty(viewValue)) {
              ctrl.$setValidity('crmMultipleEmail', true);
              return viewValue;
            }
            var emails = viewValue.split(',');
            var emailRegex = /\S+@\S+\.\S+/;

            var validityArr = emails.map(function(str){
              return emailRegex.test(str.trim());
            });

            if ($.inArray(false, validityArr) > -1) {
              ctrl.$setValidity('crmMultipleEmail', false);
            } else {
              ctrl.$setValidity('crmMultipleEmail', true);
            }
            return viewValue;
          });
        }
      };
    })
    .directive('crmUiTab', function($parse) {
      return {
        require: '^crmUiTabSet',
        restrict: 'EA',
        scope: {
          crmTitle: '@',
          crmIcon: '@',
          count: '@',
          id: '@'
        },
        template: '<div ng-transclude></div>',
        transclude: true,
        link: function (scope, element, attrs, crmUiTabSetCtrl) {
          crmUiTabSetCtrl.add(scope);
        }
      };
    })
    .directive('crmUiTabSet', function() {
      return {
        restrict: 'EA',
        scope: {
          crmUiTabSet: '@',
          tabSetOptions: '<'
        },
        templateUrl: '~/crmUi/tabset.html',
        transclude: true,
        controllerAs: 'crmUiTabSetCtrl',
        controller: function($scope, $element, $timeout) {
          var init;
          $scope.tabs = [];
          this.add = function(tab) {
            if (!tab.id) throw "Tab is missing 'id'";
            $scope.tabs.push(tab);
            if (init) {
              $timeout.cancel(init);
            }
            init = $timeout(function() {
              $element.find('.crm-tabset').tabs($scope.tabSetOptions);
            });
          };
        }
      };
    })
    .directive('crmUiValidate', function() {
      return {
        restrict: 'EA',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
          var validationKey = attrs.crmUiValidateName ? attrs.crmUiValidateName : 'crmUiValidate';
          scope.$watch(attrs.crmUiValidate, function(newValue){
            ngModel.$setValidity(validationKey, !!newValue);
          });
        }
      };
    })
    .directive('crmUiVisible', function($parse) {
      return {
        restrict: 'EA',
        scope: {
          crmUiVisible: '@'
        },
        link: function (scope, element, attrs) {
          var model = $parse(attrs.crmUiVisible);
          function updatecChildren() {
            element.css('visibility', model(scope.$parent) ? 'inherit' : 'hidden');
          }
          updatecChildren();
          scope.$parent.$watch(attrs.crmUiVisible, updatecChildren);
        }
      };
    })
    .directive('crmUiWizard', function() {
      return {
        restrict: 'EA',
        scope: {
          crmUiWizard: '@',
          crmUiWizardNavClass: '@' // string, A list of classes that will be added to the nav items
        },
        templateUrl: '~/crmUi/wizard.html',
        transclude: true,
        controllerAs: 'crmUiWizardCtrl',
        controller: function($scope, $parse) {
          var steps = $scope.steps = []; // array<$scope>
          var crmUiWizardCtrl = this;
          var maxVisited = 0;
          var selectedIndex = null;

          var findIndex = function() {
            var found = null;
            angular.forEach(steps, function(step, stepKey) {
              if (step.selected) found = stepKey;
            });
            return found;
          };
          this.$index = function() { return selectedIndex; };
          this.$first = function() { return this.$index() === 0; };
          this.$last = function() { return this.$index() === steps.length -1; };
          this.$maxVisit = function() { return maxVisited; };
          this.$validStep = function() {
            return steps[selectedIndex] && steps[selectedIndex].isStepValid();
          };
          this.iconFor = function(index) {
            if (index < this.$index()) return 'crm-i fa-check';
            if (index === this.$index()) return 'crm-i fa-angle-double-right';
            return '';
          };
          this.isSelectable = function(step) {
            if (step.selected) return false;
            return this.$validStep();
          };

          /*** @param Object step the $scope of the step */
          this.select = function(step) {
            angular.forEach(steps, function(otherStep, otherKey) {
              otherStep.selected = (otherStep === step);
              if (otherStep === step && maxVisited < otherKey) maxVisited = otherKey;
            });
            selectedIndex = findIndex();
          };
          /*** @param Object step the $scope of the step */
          this.add = function(step) {
            if (steps.length === 0) {
              step.selected = true;
              selectedIndex = 0;
            }
            steps.push(step);
            steps.sort(function(a,b){
              return a.crmUiWizardStep - b.crmUiWizardStep;
            });
            selectedIndex = findIndex();
          };
          this.remove = function(step) {
            var key = null;
            angular.forEach(steps, function(otherStep, otherKey) {
              if (otherStep === step) key = otherKey;
            });
            if (key !== null) {
              steps.splice(key, 1);
            }
          };
          this.goto = function(index) {
            if (index < 0) index = 0;
            if (index >= steps.length) index = steps.length-1;
            this.select(steps[index]);
          };
          this.previous = function() { this.goto(this.$index()-1); };
          this.next = function() { this.goto(this.$index()+1); };
          if ($scope.crmUiWizard) {
            $parse($scope.crmUiWizard).assign($scope.$parent, this);
          }
        },
        link: function (scope, element, attrs) {
          scope.ts = CRM.ts(null);

          element.find('.crm-wizard-buttons button[ng-click^=crmUiWizardCtrl]').click(function () {
            var topOfWizard = element.offset().top;
            var heightOfMenu = $('#civicrm-menu').height() || 0;

            $('html')
              .stop()
              .animate({scrollTop: topOfWizard - heightOfMenu}, 1000);
          });
        }
      };
    })
    .directive('crmUiWizardButtons', function() {
      return {
        require: '^crmUiWizard',
        restrict: 'EA',
        scope: {},
        template: '<span ng-transclude></span>',
        transclude: true,
        link: function (scope, element, attrs, crmUiWizardCtrl) {
          var realButtonsEl = $(element).closest('.crm-wizard').find('.crm-wizard-buttons');
          $(element).appendTo(realButtonsEl);
        }
      };
    })
    .directive('crmIcon', function() {
      return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
          if (element.is('[crm-ui-tab]')) {
            return;
          }
          if (attrs.crmIcon) {
            if (attrs.crmIcon.substring(0,3) == 'fa-') {
              $(element).prepend('<i class="crm-i ' + attrs.crmIcon + '" aria-hidden="true"></i> ');
            }
            else {
              $(element).prepend('<span class="icon ui-icon-' + attrs.crmIcon + '"></span> ');
            }
          }
          if ($(element).is('button:not(.btn)')) {
            $(element).addClass('crm-button');
          }
        }
      };
    })
    .directive('crmUiWizardStep', function() {
      var nextWeight = 1;
      return {
        require: ['^crmUiWizard', 'form'],
        restrict: 'EA',
        scope: {
          crmTitle: '@', // expression, evaluates to a printable string
          crmUiWizardStep: '@', // int, a weight which determines the ordering of the steps
          crmUiWizardStepClass: '@' // string, A list of classes that will be added to the template
        },
        template: '<div class="crm-wizard-step {{crmUiWizardStepClass}}" ng-show="selected" ng-transclude/></div>',
        transclude: true,
        link: function (scope, element, attrs, ctrls) {
          var crmUiWizardCtrl = ctrls[0], form = ctrls[1];
          if (scope.crmUiWizardStep) {
            scope.crmUiWizardStep = parseInt(scope.crmUiWizardStep);
          } else {
            scope.crmUiWizardStep = nextWeight++;
          }
          scope.isStepValid = function() {
            return form.$valid;
          };
          crmUiWizardCtrl.add(scope);
          scope.$on('$destroy', function(){
            crmUiWizardCtrl.remove(scope);
          });
        }
      };
    })
    .directive('crmConfirm', function ($compile, $rootScope, $templateRequest, $q) {
      var defaultFuncs = {
        'disable': function (options) {
          return {
            message: ts('Are you sure you want to disable this?'),
            options: {no: ts('Cancel'), yes: ts('Disable')},
            width: 300,
            title: ts('Disable %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        },
        'revert': function (options) {
          return {
            message: ts('Are you sure you want to revert this?'),
            options: {no: ts('Cancel'), yes: ts('Revert')},
            width: 300,
            title: ts('Revert %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        },
        'delete': function (options) {
          return {
            message: ts('Are you sure you want to delete this?'),
            options: {no: ts('Cancel'), yes: ts('Delete')},
            width: 300,
            title: ts('Delete %1?', {
              1: options.obj.title || options.obj.label || options.obj.name || ts('the record')
            })
          };
        }
      };
      var confirmCount = 0;
      return {
        link: function (scope, element, attrs) {
          $(element).click(function () {
            var options = scope.$eval(attrs.crmConfirm);
            if (attrs.title && !options.title) {
              options.title = attrs.title;
            }
            var defaults = (options.type) ? defaultFuncs[options.type](options) : {};

            var tpl = null, stubId = null;
            if (!options.message) {
              if (options.templateUrl) {
                tpl = $templateRequest(options.templateUrl);
              }
              else if (options.template) {
                tpl = options.template;
              }
              if (tpl) {
                stubId = 'crmUiConfirm_' + (++confirmCount);
                options.message = '<div id="' + stubId + '"></div>';
              }
            }

            if (options.confirmed) {
              scope.$apply(attrs.onYes);
              return;
            }

            CRM.confirm(_.extend(defaults, options))
              .on('crmConfirm:yes', function() { scope.$apply(attrs.onYes); })
              .on('crmConfirm:no', function() { scope.$apply(attrs.onNo); });

            if (tpl && stubId) {
              $q.when(tpl, function(html) {
                var scope = options.scope || $rootScope.$new();
                if (options.export) {
                  angular.extend(scope, options.export);
                }
                var linker = $compile(html);
                $('#' + stubId).append($(linker(scope)));
              });
            }
          });
        }
      };
    })
    .directive('crmPageTitle', function($timeout) {
      return {
        scope: {
          crmDocumentTitle: '='
        },
        link: function(scope, $el, attrs) {
          function update() {
            $timeout(function() {
              var newPageTitleHTML = $el.html().trim(),
                newDocumentTitle = scope.crmDocumentTitle || $el.text(),
                dialog = $el.closest('.ui-dialog-content');
              if (dialog.length) {
                dialog.dialog('option', 'title', newDocumentTitle);
                $el.hide();
              } else {
                document.title = $('title').text().replace(documentTitle, newDocumentTitle);
                [].forEach.call(document.querySelectorAll('h1:not(.crm-container h1), .crm-page-title-wrapper>h1'), h1 => {
                  if (h1.classList.contains('crm-page-title') || h1.innerHTML.trim() === pageTitleHTML) {
                    h1.classList.add('crm-page-title');
                    h1.innerHTML = newPageTitleHTML;
                    $el.hide();
                  }
                });
                pageTitleHTML = newPageTitleHTML;
                documentTitle = newDocumentTitle;
              }
            });
          }

          scope.$watch(function() {return scope.crmDocumentTitle + $el.html();}, update);
        }
      };
    })
    .directive("crmUiEditable", function() {
      return {
        restrict: "A",
        require: "ngModel",
        scope: {
          defaultValue: '='
        },
        link: function(scope, element, attrs, ngModel) {
          var ts = CRM.ts();

          function read() {
            var htmlVal = element.text();
            if (!htmlVal) {
              htmlVal = scope.defaultValue || '';
              element.text(htmlVal);
            }
            ngModel.$setViewValue(htmlVal);
          }

          ngModel.$render = function() {
            element.text(ngModel.$viewValue || scope.defaultValue || '');
          };
          element.on('keydown', function(e) {
            if (e.which === 13) {
              e.preventDefault();
              element.blur();
            }
            if (e.which === 27) {
              element.text(ngModel.$viewValue || scope.defaultValue || '');
              element.blur();
            }
          });

          element.on("blur change", function() {
            scope.$apply(read);
          });

          element.attr('contenteditable', 'true');
        }
      };
    })
    .directive('crmUiIconPicker', function($timeout) {
      return {
        restrict: 'A',
        require: '?ngModel', // Soft require ngModel
        controller: function($element, $scope, $attrs) {
          CRM.loadScript(CRM.config.resourceBase + 'js/jquery/jquery.crmIconPicker.js').then(function() {
            $timeout(function() {
              $element.crmIconPicker();
              if ($attrs.ngModel) {
                $scope.$watch($attrs.ngModel, function(newValue) {
                  if (newValue !== undefined) {
                    $element.val(newValue).trigger('change');
                  }
                });
              }
            });
          });
        }
      };
    })
    .factory('formatForSelect2', function() {
      return function(input, key, label, extra) {
        return _.transform(input, function(result, item) {
          var formatted = {id: item[key], text: item[label]};
          if (extra) {
            _.merge(formatted, _.pick(item, extra));
          }
          result.push(formatted);
        }, []);
      };
    })

    .run(function($rootScope, $location) {
      $rootScope.goto = function(path) {
        $location.path(path);
      };
    });


angular.module('crmUtil', CRM.angRequires('crmUtil'));
  angular.module('crmUtil').factory('crmApi', function($q) {
    var crmApi = function(entity, action, params, message) {
      var deferred = $q.defer();
      var p;
      var backend = crmApi.backend || CRM.api3;
      if (params && params.body_html) {
        params.body_html = params.body_html.replace(/([\u2028]|[\u2029])/g, '\n');
      }
      if (_.isObject(entity)) {
        /*jshint -W061 */
        p = backend(eval('('+angular.toJson(entity)+')'), action);
      } else {
        /*jshint -W061 */
        p = backend(entity, action, eval('('+angular.toJson(params)+')'), message);
      }
      p.then(
        function(result) {
          if (result.is_error) {
            deferred.reject(result);
          } else {
            deferred.resolve(result);
          }
        },
        function(error) {
          deferred.reject(error);
        }
      );
      return deferred.promise;
    };
    crmApi.backend = null;
    crmApi.val = function(value) {
      var d = $.Deferred();
      d.resolve(value);
      return d.promise();
    };
    return crmApi;
  });
  angular.module('crmUtil').factory('crmMetadata', function($q, crmApi) {
    function convertOptionsToMap(options) {
      var result = {};
      angular.forEach(options, function(o) {
        result[o.key] = o.value;
      });
      return result;
    }

    var cache = {}; // cache[entityName+'::'+action][fieldName].title
    var deferreds = {}; // deferreds[cacheKey].push($q.defer())
    var crmMetadata = {
      getField: function getField(entity, field) {
        return $q.when(crmMetadata.getFields(entity)).then(function(fields){
          return fields[field];
        });
      },
      getFields: function getFields(entity) {
        var action = '', cacheKey;
        if (_.isArray(entity)) {
          action = entity[1];
          entity = entity[0];
          cacheKey = entity + '::' + action;
        } else {
          cacheKey = entity;
        }

        if (_.isObject(cache[cacheKey])) {
          return cache[cacheKey];
        }

        var needFetch = _.isEmpty(deferreds[cacheKey]);
        deferreds[cacheKey] = deferreds[cacheKey] || [];
        var deferred = $q.defer();
        deferreds[cacheKey].push(deferred);

        if (needFetch) {
          crmApi(entity, 'getfields', {action: action, sequential: 1, options: {get_options: 'all'}})
            .then(
            function(fields) {
              cache[cacheKey] = _.indexBy(fields.values, 'name');
              angular.forEach(cache[cacheKey],function (field){
                if (field.options) {
                  field.optionsMap = convertOptionsToMap(field.options);
                }
              });
              angular.forEach(deferreds[cacheKey], function(dfr) {
                dfr.resolve(cache[cacheKey]);
              });
              delete deferreds[cacheKey];
            },
            function() {
              cache[cacheKey] = {}; // cache nack
              angular.forEach(deferreds[cacheKey], function(dfr) {
                dfr.reject();
              });
              delete deferreds[cacheKey];
            }
          );
        }

        return deferred.promise;
      }
    };

    return crmMetadata;
  });
  angular.module('crmUtil').factory('crmBlocker', function() {
    return function() {
      var blocks = 0;
      var result = function(promise) {
        blocks++;
        return promise.finally(function() {
          blocks--;
        });
      };
      result.check = function() {
        return blocks > 0;
      };
      return result;
    };
  });

  angular.module('crmUtil').factory('crmLegacy', function() {
    return CRM;
  });
  angular.module('crmUtil').factory('crmLog', function(){
    var level = 0;
    var write = console.log;
    function indent() {
      var s = '>';
      for (var i = 0; i < level; i++) s = s + '  ';
      return s;
    }
    var crmLog = {
      log: function(msg, vars) {
        write(indent() + msg, vars);
      },
      wrap: function(label, f) {
        return function(){
          level++;
          crmLog.log(label + ": start", arguments);
          var r;
          try {
            r = f.apply(this, arguments);
          } finally {
            crmLog.log(label + ": end");
            level--;
          }
          return r;
        };
      }
    };
    return crmLog;
  });

  angular.module('crmUtil').factory('crmNavigator', ['$window', function($window) {
    return {
      redirect: function(path) {
        $window.location.href = path;
      }
    };
  }]);
  angular.module('crmUtil').factory('crmQueue', function($q) {
    return function crmQueue(worker) {
      var queue = [];
      function next() {
        var task = queue[0];
        worker.apply(null, task.a).then(
          function onOk(data) {
            queue.shift();
            task.dfr.resolve(data);
            if (queue.length > 0) next();
          },
          function onErr(err) {
            queue.shift();
            task.dfr.reject(err);
            if (queue.length > 0) next();
          }
        );
      }
      function enqueue() {
        var dfr = $q.defer();
        queue.push({a: arguments, dfr: dfr});
        if (queue.length === 1) {
          next();
        }
        return dfr.promise;
      }
      return enqueue;
    };
  });
  angular.module('crmUtil').factory('crmStatus', function($q){
    return function(options, aPromise){
      if (aPromise) {
        return CRM.toAPromise($q, CRM.status(options, CRM.toJqPromise(aPromise)));
      } else {
        return CRM.toAPromise($q, CRM.status(options));
      }
    };
  });
  angular.module('crmUtil').factory('crmWatcher', function(){
    return function() {
      var unwatches = {}, watchFactories = {}, suspends = {};
      this.setup = function(name, newWatchFactory) {
        watchFactories[name] = newWatchFactory;
        unwatches[name] = watchFactories[name]();
        suspends[name] = 0;
        return this;
      };
      this.suspend = function(name, f) {
        suspends[name]++;
        this.teardown(name);
        var r;
        try {
          r = f.apply(this, []);
        } finally {
          if (suspends[name] === 1) {
            unwatches[name] = watchFactories[name]();
            if (!angular.isArray(unwatches[name])) {
              unwatches[name] = [unwatches[name]];
            }
          }
          suspends[name]--;
        }
        return r;
      };

      this.teardown = function(name) {
        if (!unwatches[name]) return;
        _.each(unwatches[name], function(unwatch){
          unwatch();
        });
        delete unwatches[name];
      };

      return this;
    };
  });
  angular.module('crmUtil').factory('crmThrottle', function($q) {
    var pending = [],
      executing = [];
    return function(func) {
      var deferred = $q.defer();

      function checkResult(result, success) {
        _.pull(executing, func);
        if (_.includes(pending, func)) {
          runNext();
        } else if (success) {
          deferred.resolve(result);
        } else {
          deferred.reject(result);
        }
      }

      function runNext() {
        executing.push(func);
        _.pull(pending, func);
        func().then(function(result) {
          checkResult(result, true);
        }, function(result) {
          checkResult(result, false);
        });
      }

      if (!_.includes(executing, func)) {
        runNext();
      } else if (!_.includes(pending, func)) {
        pending.push(func);
      }
      return deferred.promise;
    };
  });

  angular.module('crmUtil').factory('crmLoadScript', function($q) {
    return function(url) {
      var deferred = $q.defer();

      CRM.loadScript(url).done(function() {
        deferred.resolve(true);
      });

      return deferred.promise;
    };
  });

})(angular, CRM.$, CRM._);

(function($, angular){
angular.module('dialogService', []).service('dialogService',
	['$rootScope', '$q', '$compile', '$templateCache', '$http',
	function($rootScope, $q, $compile, $templateCache, $http) {

			var _this = this;
			_this.dialogs = {};

			this.open = function(id, template, model, options) {
				if (!angular.isDefined(id)) {
					throw "dialogService requires id in call to open";
				}

				if (!angular.isDefined(template)) {
					throw "dialogService requires template in call to open";
				}
				if (!angular.isDefined(model)) {
					model = null;
				}
				var dialogOptions = {};
				if (angular.isDefined(options)) {
					angular.extend(dialogOptions, options);
				}
				var dialog = { scope: null, ref: null, deferred: $q.defer() };
				loadTemplate(template).then(
					function(dialogTemplate) {
						dialog.scope = $rootScope.$new();
						dialog.scope.model = model;
						var dialogLinker = $compile(dialogTemplate);
						dialog.ref = $(dialogLinker(dialog.scope));
						var customCloseFn = dialogOptions.close;
						dialogOptions.close = function(event, ui) {
							if (customCloseFn) {
								customCloseFn(event, ui);
							}
							cleanup(id);
						};
						dialog.ref.dialog(dialogOptions);
						dialog.ref.dialog("open");
						_this.dialogs[id] = dialog;

					}, function(error) {
						throw error;
					}
				);
				return dialog.deferred.promise;
			};

			this.close = function(id, result) {
				var dialog = getExistingDialog(id);
				dialog.deferred.resolve(result);
				dialog.ref.dialog("close");
			};

			this.cancel = function(id) {
				var dialog = getExistingDialog(id);
				dialog.deferred.reject();
				dialog.ref.dialog("close");
			};

			this.setButtons = function(id, buttons) {
				var dialog = getExistingDialog(id);
				dialog.ref.dialog("option", 'buttons', buttons);
			};

			function cleanup (id) {
				var dialog = getExistingDialog(id);
				dialog.deferred.reject();
				dialog.scope.$destroy();
				dialog.ref.remove();
				delete _this.dialogs[id];
			};

			function getExistingDialog(id) {
				var dialog = _this.dialogs[id];
				if (!angular.isDefined(dialog)) {
					throw "DialogService does not have a reference to dialog id " + id;
				}
				return dialog;
			};
			function loadTemplate(template) {

				var deferred = $q.defer();
				var html = $templateCache.get(template);

				if (angular.isDefined(html)) {
					html = html.trim();
					deferred.resolve(html);
				} else {
					return $http.get(template, { cache : $templateCache }).then(
						function(response) {
							var html = response.data;
							if(!html || !html.length) {
								return $q.reject("Template " + template + " was not found");
							}
							html = html.trim();
							$templateCache.put(template, html);
							return html;
						}, function() {
							return $q.reject("Template " + template + " was not found");
			        	}
			        );
				}
			    return deferred.promise;
			}
		}
]);
})(jQuery, angular);

/*
 AngularJS v1.8.0
 (c) 2010-2020 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(s,c){'use strict';function P(c){var h=[];C(h,E).chars(c);return h.join("")}var D=c.$$minErr("$sanitize"),F,h,G,H,I,q,E,J,K,C;c.module("ngSanitize",[]).provider("$sanitize",function(){function f(a,e){return B(a.split(","),e)}function B(a,e){var d={},b;for(b=0;b<a.length;b++)d[e?q(a[b]):a[b]]=!0;return d}function t(a,e){e&&e.length&&h(a,B(e))}function Q(a){for(var e={},d=0,b=a.length;d<b;d++){var k=a[d];e[k.name]=k.value}return e}function L(a){return a.replace(/&/g,"&amp;").replace(z,function(a){var d=
a.charCodeAt(0);a=a.charCodeAt(1);return"&#"+(1024*(d-55296)+(a-56320)+65536)+";"}).replace(u,function(a){return"&#"+a.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}function A(a){for(;a;){if(a.nodeType===s.Node.ELEMENT_NODE)for(var e=a.attributes,d=0,b=e.length;d<b;d++){var k=e[d],g=k.name.toLowerCase();if("xmlns:ns1"===g||0===g.lastIndexOf("ns1:",0))a.removeAttributeNode(k),d--,b--}(e=a.firstChild)&&A(e);a=v("nextSibling",a)}}function v(a,e){var d=e[a];if(d&&J.call(e,d))throw D("elclob",
e.outerHTML||e.outerText);return d}var y=!1,g=!1;this.$get=["$$sanitizeUri",function(a){y=!0;g&&h(m,l);return function(e){var d=[];K(e,C(d,function(b,d){return!/^unsafe:/.test(a(b,d))}));return d.join("")}}];this.enableSvg=function(a){return I(a)?(g=a,this):g};this.addValidElements=function(a){y||(H(a)&&(a={htmlElements:a}),t(l,a.svgElements),t(r,a.htmlVoidElements),t(m,a.htmlVoidElements),t(m,a.htmlElements));return this};this.addValidAttrs=function(a){y||h(M,B(a,!0));return this};F=c.bind;h=c.extend;
G=c.forEach;H=c.isArray;I=c.isDefined;q=c.$$lowercase;E=c.noop;K=function(a,e){null===a||void 0===a?a="":"string"!==typeof a&&(a=""+a);var d=N(a);if(!d)return"";var b=5;do{if(0===b)throw D("uinput");b--;a=d.innerHTML;d=N(a)}while(a!==d.innerHTML);for(b=d.firstChild;b;){switch(b.nodeType){case 1:e.start(b.nodeName.toLowerCase(),Q(b.attributes));break;case 3:e.chars(b.textContent)}var k;if(!(k=b.firstChild)&&(1===b.nodeType&&e.end(b.nodeName.toLowerCase()),k=v("nextSibling",b),!k))for(;null==k;){b=
v("parentNode",b);if(b===d)break;k=v("nextSibling",b);1===b.nodeType&&e.end(b.nodeName.toLowerCase())}b=k}for(;b=d.firstChild;)d.removeChild(b)};C=function(a,e){var d=!1,b=F(a,a.push);return{start:function(a,g){a=q(a);!d&&w[a]&&(d=a);d||!0!==m[a]||(b("<"),b(a),G(g,function(d,g){var c=q(g),f="img"===a&&"src"===c||"background"===c;!0!==M[c]||!0===O[c]&&!e(d,f)||(b(" "),b(g),b('="'),b(L(d)),b('"'))}),b(">"))},end:function(a){a=q(a);d||!0!==m[a]||!0===r[a]||(b("</"),b(a),b(">"));a==d&&(d=!1)},chars:function(a){d||
b(L(a))}}};J=s.Node.prototype.contains||function(a){return!!(this.compareDocumentPosition(a)&16)};var z=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,u=/([^#-~ |!])/g,r=f("area,br,col,hr,img,wbr"),x=f("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),p=f("rp,rt"),n=h({},p,x),x=h({},x,f("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,section,table,ul")),p=h({},p,f("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
l=f("circle,defs,desc,ellipse,font-face,font-face-name,font-face-src,g,glyph,hkern,image,linearGradient,line,marker,metadata,missing-glyph,mpath,path,polygon,polyline,radialGradient,rect,stop,svg,switch,text,title,tspan"),w=f("script,style"),m=h({},r,x,p,n),O=f("background,cite,href,longdesc,src,xlink:href,xml:base"),n=f("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,tabindex,target,title,type,valign,value,vspace,width"),
p=f("accent-height,accumulate,additive,alphabetic,arabic-form,ascent,baseProfile,bbox,begin,by,calcMode,cap-height,class,color,color-rendering,content,cx,cy,d,dx,dy,descent,display,dur,end,fill,fill-rule,font-family,font-size,font-stretch,font-style,font-variant,font-weight,from,fx,fy,g1,g2,glyph-name,gradientUnits,hanging,height,horiz-adv-x,horiz-origin-x,ideographic,k,keyPoints,keySplines,keyTimes,lang,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mathematical,max,min,offset,opacity,orient,origin,overline-position,overline-thickness,panose-1,path,pathLength,points,preserveAspectRatio,r,refX,refY,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,rotate,rx,ry,slope,stemh,stemv,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,systemLanguage,target,text-anchor,to,transform,type,u1,u2,underline-position,underline-thickness,unicode,unicode-range,units-per-em,values,version,viewBox,visibility,width,widths,x,x-height,x1,x2,xlink:actuate,xlink:arcrole,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,xmlns,xmlns:xlink,y,y1,y2,zoomAndPan",
!0),M=h({},O,p,n),N=function(a,e){function d(b){b="<remove></remove>"+b;try{var d=(new a.DOMParser).parseFromString(b,"text/html").body;d.firstChild.remove();return d}catch(e){}}function b(a){c.innerHTML=a;e.documentMode&&A(c);return c}var g;if(e&&e.implementation)g=e.implementation.createHTMLDocument("inert");else throw D("noinert");var c=(g.documentElement||g.getDocumentElement()).querySelector("body");c.innerHTML='<svg><g onload="this.parentNode.remove()"></g></svg>';return c.querySelector("svg")?
(c.innerHTML='<svg><p><style><img src="</style><img src=x onerror=alert(1)//">',c.querySelector("svg img")?d:b):function(b){b="<remove></remove>"+b;try{b=encodeURI(b)}catch(d){return}var e=new a.XMLHttpRequest;e.responseType="document";e.open("GET","data:text/html;charset=utf-8,"+b,!1);e.send(null);b=e.response.body;b.firstChild.remove();return b}}(s,s.document)}).info({angularVersion:"1.8.0"});c.module("ngSanitize").filter("linky",["$sanitize",function(f){var h=/((s?ftp|https?):\/\/|(www\.)|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>"\u201d\u2019]/i,
t=/^mailto:/i,q=c.$$minErr("linky"),s=c.isDefined,A=c.isFunction,v=c.isObject,y=c.isString;return function(c,z,u){function r(c){c&&l.push(P(c))}function x(c,g){var f,a=p(c);l.push("<a ");for(f in a)l.push(f+'="'+a[f]+'" ');!s(z)||"target"in a||l.push('target="',z,'" ');l.push('href="',c.replace(/"/g,"&quot;"),'">');r(g);l.push("</a>")}if(null==c||""===c)return c;if(!y(c))throw q("notstring",c);for(var p=A(u)?u:v(u)?function(){return u}:function(){return{}},n=c,l=[],w,m;c=n.match(h);)w=c[0],c[2]||
c[4]||(w=(c[3]?"http://":"mailto:")+w),m=c.index,r(n.substr(0,m)),x(w,c[0].replace(t,"")),n=n.substring(m+c[0].length);r(n);return f(l.join(""))}}])})(window,window.angular);

/*
 * angular-ui-bootstrap
 * http://angular-ui.github.io/bootstrap/

 * Version: 2.5.0 - 2017-01-28
 * License: MIT
 */angular.module("ui.bootstrap",["ui.bootstrap.tpls","ui.bootstrap.collapse","ui.bootstrap.tabindex","ui.bootstrap.accordion","ui.bootstrap.alert","ui.bootstrap.buttons","ui.bootstrap.carousel","ui.bootstrap.dateparser","ui.bootstrap.isClass","ui.bootstrap.datepicker","ui.bootstrap.position","ui.bootstrap.datepickerPopup","ui.bootstrap.debounce","ui.bootstrap.multiMap","ui.bootstrap.dropdown","ui.bootstrap.stackedMap","ui.bootstrap.modal","ui.bootstrap.paging","ui.bootstrap.pager","ui.bootstrap.pagination","ui.bootstrap.tooltip","ui.bootstrap.popover","ui.bootstrap.progressbar","ui.bootstrap.rating","ui.bootstrap.tabs","ui.bootstrap.timepicker","ui.bootstrap.typeahead"]),angular.module("ui.bootstrap.tpls",["uib/template/accordion/accordion-group.html","uib/template/accordion/accordion.html","uib/template/alert/alert.html","uib/template/carousel/carousel.html","uib/template/carousel/slide.html","uib/template/datepicker/datepicker.html","uib/template/datepicker/day.html","uib/template/datepicker/month.html","uib/template/datepicker/year.html","uib/template/datepickerPopup/popup.html","uib/template/modal/window.html","uib/template/pager/pager.html","uib/template/pagination/pagination.html","uib/template/tooltip/tooltip-html-popup.html","uib/template/tooltip/tooltip-popup.html","uib/template/tooltip/tooltip-template-popup.html","uib/template/popover/popover-html.html","uib/template/popover/popover-template.html","uib/template/popover/popover.html","uib/template/progressbar/bar.html","uib/template/progressbar/progress.html","uib/template/progressbar/progressbar.html","uib/template/rating/rating.html","uib/template/tabs/tab.html","uib/template/tabs/tabset.html","uib/template/timepicker/timepicker.html","uib/template/typeahead/typeahead-match.html","uib/template/typeahead/typeahead-popup.html"]),angular.module("ui.bootstrap.collapse",[]).directive("uibCollapse",["$animate","$q","$parse","$injector",function(a,b,c,d){var e=d.has("$animateCss")?d.get("$animateCss"):null;return{link:function(d,f,g){function h(){r=!!("horizontal"in g),r?(s={width:""},t={width:"0"}):(s={height:""},t={height:"0"}),d.$eval(g.uibCollapse)||f.addClass("in").addClass("collapse").attr("aria-expanded",!0).attr("aria-hidden",!1).css(s)}function i(a){return r?{width:a.scrollWidth+"px"}:{height:a.scrollHeight+"px"}}function j(){f.hasClass("collapse")&&f.hasClass("in")||b.resolve(n(d)).then(function(){f.removeClass("collapse").addClass("collapsing").attr("aria-expanded",!0).attr("aria-hidden",!1),e?e(f,{addClass:"in",easing:"ease",css:{overflow:"hidden"},to:i(f[0])}).start()["finally"](k):a.addClass(f,"in",{css:{overflow:"hidden"},to:i(f[0])}).then(k)},angular.noop)}function k(){f.removeClass("collapsing").addClass("collapse").css(s),o(d)}function l(){return f.hasClass("collapse")||f.hasClass("in")?void b.resolve(p(d)).then(function(){f.css(i(f[0])).removeClass("collapse").addClass("collapsing").attr("aria-expanded",!1).attr("aria-hidden",!0),e?e(f,{removeClass:"in",to:t}).start()["finally"](m):a.removeClass(f,"in",{to:t}).then(m)},angular.noop):m()}function m(){f.css(t),f.removeClass("collapsing").addClass("collapse"),q(d)}var n=c(g.expanding),o=c(g.expanded),p=c(g.collapsing),q=c(g.collapsed),r=!1,s={},t={};h(),d.$watch(g.uibCollapse,function(a){a?l():j()})}}}]),angular.module("ui.bootstrap.tabindex",[]).directive("uibTabindexToggle",function(){return{restrict:"A",link:function(a,b,c){c.$observe("disabled",function(a){c.$set("tabindex",a?-1:null)})}}}),angular.module("ui.bootstrap.accordion",["ui.bootstrap.collapse","ui.bootstrap.tabindex"]).constant("uibAccordionConfig",{closeOthers:!0}).controller("UibAccordionController",["$scope","$attrs","uibAccordionConfig",function(a,b,c){this.groups=[],this.closeOthers=function(d){var e=angular.isDefined(b.closeOthers)?a.$eval(b.closeOthers):c.closeOthers;e&&angular.forEach(this.groups,function(a){a!==d&&(a.isOpen=!1)})},this.addGroup=function(a){var b=this;this.groups.push(a),a.$on("$destroy",function(c){b.removeGroup(a)})},this.removeGroup=function(a){var b=this.groups.indexOf(a);-1!==b&&this.groups.splice(b,1)}}]).directive("uibAccordion",function(){return{controller:"UibAccordionController",controllerAs:"accordion",transclude:!0,templateUrl:function(a,b){return b.templateUrl||"uib/template/accordion/accordion.html"}}}).directive("uibAccordionGroup",function(){return{require:"^uibAccordion",transclude:!0,restrict:"A",templateUrl:function(a,b){return b.templateUrl||"uib/template/accordion/accordion-group.html"},scope:{heading:"@",panelClass:"@?",isOpen:"=?",isDisabled:"=?"},controller:function(){this.setHeading=function(a){this.heading=a}},link:function(a,b,c,d){b.addClass("panel"),d.addGroup(a),a.openClass=c.openClass||"panel-open",a.panelClass=c.panelClass||"panel-default",a.$watch("isOpen",function(c){b.toggleClass(a.openClass,!!c),c&&d.closeOthers(a)}),a.toggleOpen=function(b){a.isDisabled||b&&32!==b.which||(a.isOpen=!a.isOpen)};var e="accordiongroup-"+a.$id+"-"+Math.floor(1e4*Math.random());a.headingId=e+"-tab",a.panelId=e+"-panel"}}}).directive("uibAccordionHeading",function(){return{transclude:!0,template:"",replace:!0,require:"^uibAccordionGroup",link:function(a,b,c,d,e){d.setHeading(e(a,angular.noop))}}}).directive("uibAccordionTransclude",function(){function a(){return"uib-accordion-header,data-uib-accordion-header,x-uib-accordion-header,uib\\:accordion-header,[uib-accordion-header],[data-uib-accordion-header],[x-uib-accordion-header]"}return{require:"^uibAccordionGroup",link:function(b,c,d,e){b.$watch(function(){return e[d.uibAccordionTransclude]},function(b){if(b){var d=angular.element(c[0].querySelector(a()));d.html(""),d.append(b)}})}}}),angular.module("ui.bootstrap.alert",[]).controller("UibAlertController",["$scope","$element","$attrs","$interpolate","$timeout",function(a,b,c,d,e){a.closeable=!!c.close,b.addClass("alert"),c.$set("role","alert"),a.closeable&&b.addClass("alert-dismissible");var f=angular.isDefined(c.dismissOnTimeout)?d(c.dismissOnTimeout)(a.$parent):null;f&&e(function(){a.close()},parseInt(f,10))}]).directive("uibAlert",function(){return{controller:"UibAlertController",controllerAs:"alert",restrict:"A",templateUrl:function(a,b){return b.templateUrl||"uib/template/alert/alert.html"},transclude:!0,scope:{close:"&"}}}),angular.module("ui.bootstrap.buttons",[]).constant("uibButtonConfig",{activeClass:"active",toggleEvent:"click"}).controller("UibButtonsController",["uibButtonConfig",function(a){this.activeClass=a.activeClass||"active",this.toggleEvent=a.toggleEvent||"click"}]).directive("uibBtnRadio",["$parse",function(a){return{require:["uibBtnRadio","ngModel"],controller:"UibButtonsController",controllerAs:"buttons",link:function(b,c,d,e){var f=e[0],g=e[1],h=a(d.uibUncheckable);c.find("input").css({display:"none"}),g.$render=function(){c.toggleClass(f.activeClass,angular.equals(g.$modelValue,b.$eval(d.uibBtnRadio)))},c.on(f.toggleEvent,function(){if(!d.disabled){var a=c.hasClass(f.activeClass);a&&!angular.isDefined(d.uncheckable)||b.$apply(function(){g.$setViewValue(a?null:b.$eval(d.uibBtnRadio)),g.$render()})}}),d.uibUncheckable&&b.$watch(h,function(a){d.$set("uncheckable",a?"":void 0)})}}}]).directive("uibBtnCheckbox",function(){return{require:["uibBtnCheckbox","ngModel"],controller:"UibButtonsController",controllerAs:"button",link:function(a,b,c,d){function e(){return g(c.btnCheckboxTrue,!0)}function f(){return g(c.btnCheckboxFalse,!1)}function g(b,c){return angular.isDefined(b)?a.$eval(b):c}var h=d[0],i=d[1];b.find("input").css({display:"none"}),i.$render=function(){b.toggleClass(h.activeClass,angular.equals(i.$modelValue,e()))},b.on(h.toggleEvent,function(){c.disabled||a.$apply(function(){i.$setViewValue(b.hasClass(h.activeClass)?f():e()),i.$render()})})}}}),angular.module("ui.bootstrap.carousel",[]).controller("UibCarouselController",["$scope","$element","$interval","$timeout","$animate",function(a,b,c,d,e){function f(a){for(var b=0;b<p.length;b++)p[b].slide.active=b===a}function g(c,d,g){if(!s){if(angular.extend(c,{direction:g}),angular.extend(p[r].slide||{},{direction:g}),e.enabled(b)&&!a.$currentTransition&&p[d].element&&o.slides.length>1){p[d].element.data(q,c.direction);var h=o.getCurrentIndex();angular.isNumber(h)&&p[h].element&&p[h].element.data(q,c.direction),a.$currentTransition=!0,e.on("addClass",p[d].element,function(b,c){"close"===c&&(a.$currentTransition=null,e.off("addClass",b))})}a.active=c.index,r=c.index,f(d),k()}}function h(a){for(var b=0;b<p.length;b++)if(p[b].slide===a)return b}function i(){m&&(c.cancel(m),m=null)}function j(b){b.length||(a.$currentTransition=null)}function k(){i();var b=+a.interval;!isNaN(b)&&b>0&&(m=c(l,b))}function l(){var b=+a.interval;n&&!isNaN(b)&&b>0&&p.length?a.next():a.pause()}var m,n,o=this,p=o.slides=a.slides=[],q="uib-slideDirection",r=a.active,s=!1;b.addClass("carousel"),o.addSlide=function(b,c){p.push({slide:b,element:c}),p.sort(function(a,b){return+a.slide.index-+b.slide.index}),(b.index===a.active||1===p.length&&!angular.isNumber(a.active))&&(a.$currentTransition&&(a.$currentTransition=null),r=b.index,a.active=b.index,f(r),o.select(p[h(b)]),1===p.length&&a.play())},o.getCurrentIndex=function(){for(var a=0;a<p.length;a++)if(p[a].slide.index===r)return a},o.next=a.next=function(){var b=(o.getCurrentIndex()+1)%p.length;return 0===b&&a.noWrap()?void a.pause():o.select(p[b],"next")},o.prev=a.prev=function(){var b=o.getCurrentIndex()-1<0?p.length-1:o.getCurrentIndex()-1;return a.noWrap()&&b===p.length-1?void a.pause():o.select(p[b],"prev")},o.removeSlide=function(b){var c=h(b);p.splice(c,1),p.length>0&&r===c?c>=p.length?(r=p.length-1,a.active=r,f(r),o.select(p[p.length-1])):(r=c,a.active=r,f(r),o.select(p[c])):r>c&&(r--,a.active=r),0===p.length&&(r=null,a.active=null)},o.select=a.select=function(b,c){var d=h(b.slide);void 0===c&&(c=d>o.getCurrentIndex()?"next":"prev"),b.slide.index===r||a.$currentTransition||g(b.slide,d,c)},a.indexOfSlide=function(a){return+a.slide.index},a.isActive=function(b){return a.active===b.slide.index},a.isPrevDisabled=function(){return 0===a.active&&a.noWrap()},a.isNextDisabled=function(){return a.active===p.length-1&&a.noWrap()},a.pause=function(){a.noPause||(n=!1,i())},a.play=function(){n||(n=!0,k())},b.on("mouseenter",a.pause),b.on("mouseleave",a.play),a.$on("$destroy",function(){s=!0,i()}),a.$watch("noTransition",function(a){e.enabled(b,!a)}),a.$watch("interval",k),a.$watchCollection("slides",j),a.$watch("active",function(a){if(angular.isNumber(a)&&r!==a){for(var b=0;b<p.length;b++)if(p[b].slide.index===a){a=b;break}var c=p[a];c&&(f(a),o.select(p[a]),r=a)}})}]).directive("uibCarousel",function(){return{transclude:!0,controller:"UibCarouselController",controllerAs:"carousel",restrict:"A",templateUrl:function(a,b){return b.templateUrl||"uib/template/carousel/carousel.html"},scope:{active:"=",interval:"=",noTransition:"=",noPause:"=",noWrap:"&"}}}).directive("uibSlide",["$animate",function(a){return{require:"^uibCarousel",restrict:"A",transclude:!0,templateUrl:function(a,b){return b.templateUrl||"uib/template/carousel/slide.html"},scope:{actual:"=?",index:"=?"},link:function(b,c,d,e){c.addClass("item"),e.addSlide(b,c),b.$on("$destroy",function(){e.removeSlide(b)}),b.$watch("active",function(b){a[b?"addClass":"removeClass"](c,"active")})}}}]).animation(".item",["$animateCss",function(a){function b(a,b,c){a.removeClass(b),c&&c()}var c="uib-slideDirection";return{beforeAddClass:function(d,e,f){if("active"===e){var g=!1,h=d.data(c),i="next"===h?"left":"right",j=b.bind(this,d,i+" "+h,f);return d.addClass(h),a(d,{addClass:i}).start().done(j),function(){g=!0}}f()},beforeRemoveClass:function(d,e,f){if("active"===e){var g=!1,h=d.data(c),i="next"===h?"left":"right",j=b.bind(this,d,i,f);return a(d,{addClass:i}).start().done(j),function(){g=!0}}f()}}}]),angular.module("ui.bootstrap.dateparser",[]).service("uibDateParser",["$log","$locale","dateFilter","orderByFilter","filterFilter",function(a,b,c,d,e){function f(a){return e(s,{key:a},!0)[0]}function g(a){var b=[],c=a.split(""),e=a.indexOf("'");if(e>-1){var f=!1;a=a.split("");for(var g=e;g<a.length;g++)f?("'"===a[g]&&(g+1<a.length&&"'"===a[g+1]?(a[g+1]="$",c[g+1]=""):(c[g]="",f=!1)),a[g]="$"):"'"===a[g]&&(a[g]="$",c[g]="",f=!0);a=a.join("")}return angular.forEach(s,function(d){var e=a.indexOf(d.key);if(e>-1){a=a.split(""),c[e]="("+d.regex+")",a[e]="$";for(var f=e+1,g=e+d.key.length;g>f;f++)c[f]="",a[f]="$";a=a.join(""),b.push({index:e,key:d.key,apply:d.apply,matcher:d.regex})}}),{regex:new RegExp("^"+c.join("")+"$"),map:d(b,"index")}}function h(a){for(var b,c,d=[],e=0;e<a.length;)if(angular.isNumber(c)){if("'"===a.charAt(e))(e+1>=a.length||"'"!==a.charAt(e+1))&&(d.push(i(a,c,e)),c=null);else if(e===a.length)for(;c<a.length;)b=j(a,c),d.push(b),c=b.endIdx;e++}else"'"!==a.charAt(e)?(b=j(a,e),d.push(b.parser),e=b.endIdx):(c=e,e++);return d}function i(a,b,c){return function(){return a.substr(b+1,c-b-1)}}function j(a,b){for(var c=a.substr(b),d=0;d<s.length;d++)if(new RegExp("^"+s[d].key).test(c)){var e=s[d];return{endIdx:b+e.key.length,parser:e.formatter}}return{endIdx:b+1,parser:function(){return c.charAt(0)}}}function k(a,b,c){return 1>c?!1:1===b&&c>28?29===c&&(a%4===0&&a%100!==0||a%400===0):3===b||5===b||8===b||10===b?31>c:!0}function l(a){return parseInt(a,10)}function m(a,b){return a&&b?q(a,b):a}function n(a,b){return a&&b?q(a,b,!0):a}function o(a,b){a=a.replace(/:/g,"");var c=Date.parse("Jan 01, 1970 00:00:00 "+a)/6e4;return isNaN(c)?b:c}function p(a,b){return a=new Date(a.getTime()),a.setMinutes(a.getMinutes()+b),a}function q(a,b,c){c=c?-1:1;var d=a.getTimezoneOffset(),e=o(b,d);return p(a,c*(e-d))}var r,s,t=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;this.init=function(){r=b.id,this.parsers={},this.formatters={},s=[{key:"yyyy",regex:"\\d{4}",apply:function(a){this.year=+a},formatter:function(a){var b=new Date;return b.setFullYear(Math.abs(a.getFullYear())),c(b,"yyyy")}},{key:"yy",regex:"\\d{2}",apply:function(a){a=+a,this.year=69>a?a+2e3:a+1900},formatter:function(a){var b=new Date;return b.setFullYear(Math.abs(a.getFullYear())),c(b,"yy")}},{key:"y",regex:"\\d{1,4}",apply:function(a){this.year=+a},formatter:function(a){var b=new Date;return b.setFullYear(Math.abs(a.getFullYear())),c(b,"y")}},{key:"M!",regex:"0?[1-9]|1[0-2]",apply:function(a){this.month=a-1},formatter:function(a){var b=a.getMonth();return/^[0-9]$/.test(b)?c(a,"MM"):c(a,"M")}},{key:"MMMM",regex:b.DATETIME_FORMATS.MONTH.join("|"),apply:function(a){this.month=b.DATETIME_FORMATS.MONTH.indexOf(a)},formatter:function(a){return c(a,"MMMM")}},{key:"MMM",regex:b.DATETIME_FORMATS.SHORTMONTH.join("|"),apply:function(a){this.month=b.DATETIME_FORMATS.SHORTMONTH.indexOf(a)},formatter:function(a){return c(a,"MMM")}},{key:"MM",regex:"0[1-9]|1[0-2]",apply:function(a){this.month=a-1},formatter:function(a){return c(a,"MM")}},{key:"M",regex:"[1-9]|1[0-2]",apply:function(a){this.month=a-1},formatter:function(a){return c(a,"M")}},{key:"d!",regex:"[0-2]?[0-9]{1}|3[0-1]{1}",apply:function(a){this.date=+a},formatter:function(a){var b=a.getDate();return/^[1-9]$/.test(b)?c(a,"dd"):c(a,"d")}},{key:"dd",regex:"[0-2][0-9]{1}|3[0-1]{1}",apply:function(a){this.date=+a},formatter:function(a){return c(a,"dd")}},{key:"d",regex:"[1-2]?[0-9]{1}|3[0-1]{1}",apply:function(a){this.date=+a},formatter:function(a){return c(a,"d")}},{key:"EEEE",regex:b.DATETIME_FORMATS.DAY.join("|"),formatter:function(a){return c(a,"EEEE")}},{key:"EEE",regex:b.DATETIME_FORMATS.SHORTDAY.join("|"),formatter:function(a){return c(a,"EEE")}},{key:"HH",regex:"(?:0|1)[0-9]|2[0-3]",apply:function(a){this.hours=+a},formatter:function(a){return c(a,"HH")}},{key:"hh",regex:"0[0-9]|1[0-2]",apply:function(a){this.hours=+a},formatter:function(a){return c(a,"hh")}},{key:"H",regex:"1?[0-9]|2[0-3]",apply:function(a){this.hours=+a},formatter:function(a){return c(a,"H")}},{key:"h",regex:"[0-9]|1[0-2]",apply:function(a){this.hours=+a},formatter:function(a){return c(a,"h")}},{key:"mm",regex:"[0-5][0-9]",apply:function(a){this.minutes=+a},formatter:function(a){return c(a,"mm")}},{key:"m",regex:"[0-9]|[1-5][0-9]",apply:function(a){this.minutes=+a},formatter:function(a){return c(a,"m")}},{key:"sss",regex:"[0-9][0-9][0-9]",apply:function(a){this.milliseconds=+a},formatter:function(a){return c(a,"sss")}},{key:"ss",regex:"[0-5][0-9]",apply:function(a){this.seconds=+a},formatter:function(a){return c(a,"ss")}},{key:"s",regex:"[0-9]|[1-5][0-9]",apply:function(a){this.seconds=+a},formatter:function(a){return c(a,"s")}},{key:"a",regex:b.DATETIME_FORMATS.AMPMS.join("|"),apply:function(a){12===this.hours&&(this.hours=0),"PM"===a&&(this.hours+=12)},formatter:function(a){return c(a,"a")}},{key:"Z",regex:"[+-]\\d{4}",apply:function(a){var b=a.match(/([+-])(\d{2})(\d{2})/),c=b[1],d=b[2],e=b[3];this.hours+=l(c+d),this.minutes+=l(c+e)},formatter:function(a){return c(a,"Z")}},{key:"ww",regex:"[0-4][0-9]|5[0-3]",formatter:function(a){return c(a,"ww")}},{key:"w",regex:"[0-9]|[1-4][0-9]|5[0-3]",formatter:function(a){return c(a,"w")}},{key:"GGGG",regex:b.DATETIME_FORMATS.ERANAMES.join("|").replace(/\s/g,"\\s"),formatter:function(a){return c(a,"GGGG")}},{key:"GGG",regex:b.DATETIME_FORMATS.ERAS.join("|"),formatter:function(a){return c(a,"GGG")}},{key:"GG",regex:b.DATETIME_FORMATS.ERAS.join("|"),formatter:function(a){return c(a,"GG")}},{key:"G",regex:b.DATETIME_FORMATS.ERAS.join("|"),formatter:function(a){return c(a,"G")}}],angular.version.major>=1&&angular.version.minor>4&&s.push({key:"LLLL",regex:b.DATETIME_FORMATS.STANDALONEMONTH.join("|"),apply:function(a){this.month=b.DATETIME_FORMATS.STANDALONEMONTH.indexOf(a)},formatter:function(a){return c(a,"LLLL")}})},this.init(),this.getParser=function(a){var b=f(a);return b&&b.apply||null},this.overrideParser=function(a,b){var c=f(a);c&&angular.isFunction(b)&&(this.parsers={},c.apply=b)}.bind(this),this.filter=function(a,c){if(!angular.isDate(a)||isNaN(a)||!c)return"";c=b.DATETIME_FORMATS[c]||c,b.id!==r&&this.init(),this.formatters[c]||(this.formatters[c]=h(c));var d=this.formatters[c];return d.reduce(function(b,c){return b+c(a)},"")},this.parse=function(c,d,e){if(!angular.isString(c)||!d)return c;d=b.DATETIME_FORMATS[d]||d,d=d.replace(t,"\\$&"),b.id!==r&&this.init(),this.parsers[d]||(this.parsers[d]=g(d,"apply"));var f=this.parsers[d],h=f.regex,i=f.map,j=c.match(h),l=!1;if(j&&j.length){var m,n;angular.isDate(e)&&!isNaN(e.getTime())?m={year:e.getFullYear(),month:e.getMonth(),date:e.getDate(),hours:e.getHours(),minutes:e.getMinutes(),seconds:e.getSeconds(),milliseconds:e.getMilliseconds()}:(e&&a.warn("dateparser:","baseDate is not a valid date"),m={year:1900,month:0,date:1,hours:0,minutes:0,seconds:0,milliseconds:0});for(var o=1,p=j.length;p>o;o++){var q=i[o-1];"Z"===q.matcher&&(l=!0),q.apply&&q.apply.call(m,j[o])}var s=l?Date.prototype.setUTCFullYear:Date.prototype.setFullYear,u=l?Date.prototype.setUTCHours:Date.prototype.setHours;return k(m.year,m.month,m.date)&&(!angular.isDate(e)||isNaN(e.getTime())||l?(n=new Date(0),s.call(n,m.year,m.month,m.date),u.call(n,m.hours||0,m.minutes||0,m.seconds||0,m.milliseconds||0)):(n=new Date(e),s.call(n,m.year,m.month,m.date),u.call(n,m.hours,m.minutes,m.seconds,m.milliseconds))),n}},this.toTimezone=m,this.fromTimezone=n,this.timezoneToOffset=o,this.addDateMinutes=p,this.convertTimezoneToLocal=q}]),angular.module("ui.bootstrap.isClass",[]).directive("uibIsClass",["$animate",function(a){var b=/^\s*([\s\S]+?)\s+on\s+([\s\S]+?)\s*$/,c=/^\s*([\s\S]+?)\s+for\s+([\s\S]+?)\s*$/;return{restrict:"A",compile:function(d,e){function f(a,b,c){i.push(a),j.push({scope:a,element:b}),o.forEach(function(b,c){g(b,a)}),a.$on("$destroy",h)}function g(b,d){var e=b.match(c),f=d.$eval(e[1]),g=e[2],h=k[b];if(!h){var i=function(b){var c=null;j.some(function(a){var d=a.scope.$eval(m);return d===b?(c=a,!0):void 0}),h.lastActivated!==c&&(h.lastActivated&&a.removeClass(h.lastActivated.element,f),c&&a.addClass(c.element,f),h.lastActivated=c)};k[b]=h={lastActivated:null,scope:d,watchFn:i,compareWithExp:g,watcher:d.$watch(g,i)}}h.watchFn(d.$eval(g))}function h(a){var b=a.targetScope,c=i.indexOf(b);if(i.splice(c,1),j.splice(c,1),i.length){var d=i[0];angular.forEach(k,function(a){a.scope===b&&(a.watcher=d.$watch(a.compareWithExp,a.watchFn),a.scope=d)})}else k={}}var i=[],j=[],k={},l=e.uibIsClass.match(b),m=l[2],n=l[1],o=n.split(",");return f}}}]),angular.module("ui.bootstrap.datepicker",["ui.bootstrap.dateparser","ui.bootstrap.isClass"]).value("$datepickerSuppressError",!1).value("$datepickerLiteralWarning",!0).constant("uibDatepickerConfig",{datepickerMode:"day",formatDay:"dd",formatMonth:"MMMM",formatYear:"yyyy",formatDayHeader:"EEE",formatDayTitle:"MMMM yyyy",formatMonthTitle:"yyyy",maxDate:null,maxMode:"year",minDate:null,minMode:"day",monthColumns:3,ngModelOptions:{},shortcutPropagation:!1,showWeeks:!0,yearColumns:5,yearRows:4}).controller("UibDatepickerController",["$scope","$element","$attrs","$parse","$interpolate","$locale","$log","dateFilter","uibDatepickerConfig","$datepickerLiteralWarning","$datepickerSuppressError","uibDateParser",function(a,b,c,d,e,f,g,h,i,j,k,l){function m(b){a.datepickerMode=b,a.datepickerOptions.datepickerMode=b}function n(b){var c;if(angular.version.minor<6)c=b.$options||a.datepickerOptions.ngModelOptions||i.ngModelOptions||{},c.getOption=function(a){return c[a]};else{var d=b.$options.getOption("timezone")||(a.datepickerOptions.ngModelOptions?a.datepickerOptions.ngModelOptions.timezone:null)||(i.ngModelOptions?i.ngModelOptions.timezone:null);c=b.$options.createChild(i.ngModelOptions).createChild(a.datepickerOptions.ngModelOptions).createChild(b.$options).createChild({timezone:d})}return c}var o=this,p={$setViewValue:angular.noop},q={},r=[];b.addClass("uib-datepicker"),c.$set("role","application"),a.datepickerOptions||(a.datepickerOptions={}),this.modes=["day","month","year"],["customClass","dateDisabled","datepickerMode","formatDay","formatDayHeader","formatDayTitle","formatMonth","formatMonthTitle","formatYear","maxDate","maxMode","minDate","minMode","monthColumns","showWeeks","shortcutPropagation","startingDay","yearColumns","yearRows"].forEach(function(b){switch(b){case"customClass":case"dateDisabled":a[b]=a.datepickerOptions[b]||angular.noop;break;case"datepickerMode":a.datepickerMode=angular.isDefined(a.datepickerOptions.datepickerMode)?a.datepickerOptions.datepickerMode:i.datepickerMode;break;case"formatDay":case"formatDayHeader":case"formatDayTitle":case"formatMonth":case"formatMonthTitle":case"formatYear":o[b]=angular.isDefined(a.datepickerOptions[b])?e(a.datepickerOptions[b])(a.$parent):i[b];break;case"monthColumns":case"showWeeks":case"shortcutPropagation":case"yearColumns":case"yearRows":o[b]=angular.isDefined(a.datepickerOptions[b])?a.datepickerOptions[b]:i[b];break;case"startingDay":angular.isDefined(a.datepickerOptions.startingDay)?o.startingDay=a.datepickerOptions.startingDay:angular.isNumber(i.startingDay)?o.startingDay=i.startingDay:o.startingDay=(f.DATETIME_FORMATS.FIRSTDAYOFWEEK+8)%7;break;case"maxDate":case"minDate":a.$watch("datepickerOptions."+b,function(a){a?angular.isDate(a)?o[b]=l.fromTimezone(new Date(a),q.getOption("timezone")):(j&&g.warn("Literal date support has been deprecated, please switch to date object usage"),o[b]=new Date(h(a,"medium"))):o[b]=i[b]?l.fromTimezone(new Date(i[b]),q.getOption("timezone")):null,o.refreshView()});break;case"maxMode":case"minMode":a.datepickerOptions[b]?a.$watch(function(){return a.datepickerOptions[b]},function(c){o[b]=a[b]=angular.isDefined(c)?c:a.datepickerOptions[b],("minMode"===b&&o.modes.indexOf(a.datepickerOptions.datepickerMode)<o.modes.indexOf(o[b])||"maxMode"===b&&o.modes.indexOf(a.datepickerOptions.datepickerMode)>o.modes.indexOf(o[b]))&&(a.datepickerMode=o[b],a.datepickerOptions.datepickerMode=o[b])}):o[b]=a[b]=i[b]||null}}),a.uniqueId="datepicker-"+a.$id+"-"+Math.floor(1e4*Math.random()),a.disabled=angular.isDefined(c.disabled)||!1,angular.isDefined(c.ngDisabled)&&r.push(a.$parent.$watch(c.ngDisabled,function(b){a.disabled=b,o.refreshView()})),a.isActive=function(b){return 0===o.compare(b.date,o.activeDate)?(a.activeDateId=b.uid,!0):!1},this.init=function(b){p=b,q=n(p),a.datepickerOptions.initDate?(o.activeDate=l.fromTimezone(a.datepickerOptions.initDate,q.getOption("timezone"))||new Date,a.$watch("datepickerOptions.initDate",function(a){a&&(p.$isEmpty(p.$modelValue)||p.$invalid)&&(o.activeDate=l.fromTimezone(a,q.getOption("timezone")),o.refreshView())})):o.activeDate=new Date;var c=p.$modelValue?new Date(p.$modelValue):new Date;this.activeDate=isNaN(c)?l.fromTimezone(new Date,q.getOption("timezone")):l.fromTimezone(c,q.getOption("timezone")),p.$render=function(){o.render()}},this.render=function(){if(p.$viewValue){var a=new Date(p.$viewValue),b=!isNaN(a);b?this.activeDate=l.fromTimezone(a,q.getOption("timezone")):k||g.error('Datepicker directive: "ng-model" value must be a Date object')}this.refreshView()},this.refreshView=function(){if(this.element){a.selectedDt=null,this._refreshView(),a.activeDt&&(a.activeDateId=a.activeDt.uid);var b=p.$viewValue?new Date(p.$viewValue):null;b=l.fromTimezone(b,q.getOption("timezone")),p.$setValidity("dateDisabled",!b||this.element&&!this.isDisabled(b))}},this.createDateObject=function(b,c){var d=p.$viewValue?new Date(p.$viewValue):null;d=l.fromTimezone(d,q.getOption("timezone"));var e=new Date;e=l.fromTimezone(e,q.getOption("timezone"));var f=this.compare(b,e),g={date:b,label:l.filter(b,c),selected:d&&0===this.compare(b,d),disabled:this.isDisabled(b),past:0>f,current:0===f,future:f>0,customClass:this.customClass(b)||null};return d&&0===this.compare(b,d)&&(a.selectedDt=g),o.activeDate&&0===this.compare(g.date,o.activeDate)&&(a.activeDt=g),g},this.isDisabled=function(b){return a.disabled||this.minDate&&this.compare(b,this.minDate)<0||this.maxDate&&this.compare(b,this.maxDate)>0||a.dateDisabled&&a.dateDisabled({date:b,mode:a.datepickerMode})},this.customClass=function(b){return a.customClass({date:b,mode:a.datepickerMode})},this.split=function(a,b){for(var c=[];a.length>0;)c.push(a.splice(0,b));return c},a.select=function(b){if(a.datepickerMode===o.minMode){var c=p.$viewValue?l.fromTimezone(new Date(p.$viewValue),q.getOption("timezone")):new Date(0,0,0,0,0,0,0);c.setFullYear(b.getFullYear(),b.getMonth(),b.getDate()),c=l.toTimezone(c,q.getOption("timezone")),p.$setViewValue(c),p.$render()}else o.activeDate=b,m(o.modes[o.modes.indexOf(a.datepickerMode)-1]),a.$emit("uib:datepicker.mode");a.$broadcast("uib:datepicker.focus")},a.move=function(a){var b=o.activeDate.getFullYear()+a*(o.step.years||0),c=o.activeDate.getMonth()+a*(o.step.months||0);o.activeDate.setFullYear(b,c,1),o.refreshView()},a.toggleMode=function(b){b=b||1,a.datepickerMode===o.maxMode&&1===b||a.datepickerMode===o.minMode&&-1===b||(m(o.modes[o.modes.indexOf(a.datepickerMode)+b]),a.$emit("uib:datepicker.mode"))},a.keys={13:"enter",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down"};var s=function(){o.element[0].focus()};a.$on("uib:datepicker.focus",s),a.keydown=function(b){var c=a.keys[b.which];if(c&&!b.shiftKey&&!b.altKey&&!a.disabled)if(b.preventDefault(),o.shortcutPropagation||b.stopPropagation(),"enter"===c||"space"===c){if(o.isDisabled(o.activeDate))return;a.select(o.activeDate)}else!b.ctrlKey||"up"!==c&&"down"!==c?(o.handleKeyDown(c,b),o.refreshView()):a.toggleMode("up"===c?1:-1)},b.on("keydown",function(b){a.$apply(function(){a.keydown(b)})}),a.$on("$destroy",function(){for(;r.length;)r.shift()()})}]).controller("UibDaypickerController",["$scope","$element","dateFilter",function(a,b,c){function d(a,b){return 1!==b||a%4!==0||a%100===0&&a%400!==0?f[b]:29}function e(a){var b=new Date(a);b.setDate(b.getDate()+4-(b.getDay()||7));var c=b.getTime();return b.setMonth(0),b.setDate(1),Math.floor(Math.round((c-b)/864e5)/7)+1}var f=[31,28,31,30,31,30,31,31,30,31,30,31];this.step={months:1},this.element=b,this.init=function(b){angular.extend(b,this),a.showWeeks=b.showWeeks,b.refreshView()},this.getDates=function(a,b){for(var c,d=new Array(b),e=new Date(a),f=0;b>f;)c=new Date(e),d[f++]=c,e.setDate(e.getDate()+1);return d},this._refreshView=function(){var b=this.activeDate.getFullYear(),d=this.activeDate.getMonth(),f=new Date(this.activeDate);f.setFullYear(b,d,1);var g=this.startingDay-f.getDay(),h=g>0?7-g:-g,i=new Date(f);h>0&&i.setDate(-h+1);for(var j=this.getDates(i,42),k=0;42>k;k++)j[k]=angular.extend(this.createDateObject(j[k],this.formatDay),{secondary:j[k].getMonth()!==d,uid:a.uniqueId+"-"+k});a.labels=new Array(7);for(var l=0;7>l;l++)a.labels[l]={abbr:c(j[l].date,this.formatDayHeader),full:c(j[l].date,"EEEE")};if(a.title=c(this.activeDate,this.formatDayTitle),a.rows=this.split(j,7),a.showWeeks){a.weekNumbers=[];for(var m=(11-this.startingDay)%7,n=a.rows.length,o=0;n>o;o++)a.weekNumbers.push(e(a.rows[o][m].date))}},this.compare=function(a,b){var c=new Date(a.getFullYear(),a.getMonth(),a.getDate()),d=new Date(b.getFullYear(),b.getMonth(),b.getDate());return c.setFullYear(a.getFullYear()),d.setFullYear(b.getFullYear()),c-d},this.handleKeyDown=function(a,b){var c=this.activeDate.getDate();if("left"===a)c-=1;else if("up"===a)c-=7;else if("right"===a)c+=1;else if("down"===a)c+=7;else if("pageup"===a||"pagedown"===a){var e=this.activeDate.getMonth()+("pageup"===a?-1:1);this.activeDate.setMonth(e,1),c=Math.min(d(this.activeDate.getFullYear(),this.activeDate.getMonth()),c)}else"home"===a?c=1:"end"===a&&(c=d(this.activeDate.getFullYear(),this.activeDate.getMonth()));this.activeDate.setDate(c)}}]).controller("UibMonthpickerController",["$scope","$element","dateFilter",function(a,b,c){this.step={years:1},this.element=b,this.init=function(a){angular.extend(a,this),a.refreshView()},this._refreshView=function(){for(var b,d=new Array(12),e=this.activeDate.getFullYear(),f=0;12>f;f++)b=new Date(this.activeDate),b.setFullYear(e,f,1),d[f]=angular.extend(this.createDateObject(b,this.formatMonth),{uid:a.uniqueId+"-"+f});a.title=c(this.activeDate,this.formatMonthTitle),a.rows=this.split(d,this.monthColumns),a.yearHeaderColspan=this.monthColumns>3?this.monthColumns-2:1},this.compare=function(a,b){var c=new Date(a.getFullYear(),a.getMonth()),d=new Date(b.getFullYear(),b.getMonth());return c.setFullYear(a.getFullYear()),d.setFullYear(b.getFullYear()),c-d},this.handleKeyDown=function(a,b){var c=this.activeDate.getMonth();if("left"===a)c-=1;else if("up"===a)c-=this.monthColumns;else if("right"===a)c+=1;else if("down"===a)c+=this.monthColumns;else if("pageup"===a||"pagedown"===a){var d=this.activeDate.getFullYear()+("pageup"===a?-1:1);this.activeDate.setFullYear(d)}else"home"===a?c=0:"end"===a&&(c=11);this.activeDate.setMonth(c)}}]).controller("UibYearpickerController",["$scope","$element","dateFilter",function(a,b,c){function d(a){return parseInt((a-1)/f,10)*f+1}var e,f;this.element=b,this.yearpickerInit=function(){e=this.yearColumns,f=this.yearRows*e,this.step={years:f}},this._refreshView=function(){for(var b,c=new Array(f),g=0,h=d(this.activeDate.getFullYear());f>g;g++)b=new Date(this.activeDate),b.setFullYear(h+g,0,1),c[g]=angular.extend(this.createDateObject(b,this.formatYear),{uid:a.uniqueId+"-"+g});a.title=[c[0].label,c[f-1].label].join(" - "),a.rows=this.split(c,e),a.columns=e},this.compare=function(a,b){return a.getFullYear()-b.getFullYear()},this.handleKeyDown=function(a,b){var c=this.activeDate.getFullYear();"left"===a?c-=1:"up"===a?c-=e:"right"===a?c+=1:"down"===a?c+=e:"pageup"===a||"pagedown"===a?c+=("pageup"===a?-1:1)*f:"home"===a?c=d(this.activeDate.getFullYear()):"end"===a&&(c=d(this.activeDate.getFullYear())+f-1),this.activeDate.setFullYear(c)}}]).directive("uibDatepicker",function(){return{templateUrl:function(a,b){return b.templateUrl||"uib/template/datepicker/datepicker.html"},scope:{datepickerOptions:"=?"},require:["uibDatepicker","^ngModel"],restrict:"A",controller:"UibDatepickerController",controllerAs:"datepicker",link:function(a,b,c,d){var e=d[0],f=d[1];e.init(f)}}}).directive("uibDaypicker",function(){return{templateUrl:function(a,b){return b.templateUrl||"uib/template/datepicker/day.html"},
require:["^uibDatepicker","uibDaypicker"],restrict:"A",controller:"UibDaypickerController",link:function(a,b,c,d){var e=d[0],f=d[1];f.init(e)}}}).directive("uibMonthpicker",function(){return{templateUrl:function(a,b){return b.templateUrl||"uib/template/datepicker/month.html"},require:["^uibDatepicker","uibMonthpicker"],restrict:"A",controller:"UibMonthpickerController",link:function(a,b,c,d){var e=d[0],f=d[1];f.init(e)}}}).directive("uibYearpicker",function(){return{templateUrl:function(a,b){return b.templateUrl||"uib/template/datepicker/year.html"},require:["^uibDatepicker","uibYearpicker"],restrict:"A",controller:"UibYearpickerController",link:function(a,b,c,d){var e=d[0];angular.extend(e,d[1]),e.yearpickerInit(),e.refreshView()}}}),angular.module("ui.bootstrap.position",[]).factory("$uibPosition",["$document","$window",function(a,b){var c,d,e={normal:/(auto|scroll)/,hidden:/(auto|scroll|hidden)/},f={auto:/\s?auto?\s?/i,primary:/^(top|bottom|left|right)$/,secondary:/^(top|bottom|left|right|center)$/,vertical:/^(top|bottom)$/},g=/(HTML|BODY)/;return{getRawNode:function(a){return a.nodeName?a:a[0]||a},parseStyle:function(a){return a=parseFloat(a),isFinite(a)?a:0},offsetParent:function(c){function d(a){return"static"===(b.getComputedStyle(a).position||"static")}c=this.getRawNode(c);for(var e=c.offsetParent||a[0].documentElement;e&&e!==a[0].documentElement&&d(e);)e=e.offsetParent;return e||a[0].documentElement},scrollbarWidth:function(e){if(e){if(angular.isUndefined(d)){var f=a.find("body");f.addClass("uib-position-body-scrollbar-measure"),d=b.innerWidth-f[0].clientWidth,d=isFinite(d)?d:0,f.removeClass("uib-position-body-scrollbar-measure")}return d}if(angular.isUndefined(c)){var g=angular.element('<div class="uib-position-scrollbar-measure"></div>');a.find("body").append(g),c=g[0].offsetWidth-g[0].clientWidth,c=isFinite(c)?c:0,g.remove()}return c},scrollbarPadding:function(a){a=this.getRawNode(a);var c=b.getComputedStyle(a),d=this.parseStyle(c.paddingRight),e=this.parseStyle(c.paddingBottom),f=this.scrollParent(a,!1,!0),h=this.scrollbarWidth(g.test(f.tagName));return{scrollbarWidth:h,widthOverflow:f.scrollWidth>f.clientWidth,right:d+h,originalRight:d,heightOverflow:f.scrollHeight>f.clientHeight,bottom:e+h,originalBottom:e}},isScrollable:function(a,c){a=this.getRawNode(a);var d=c?e.hidden:e.normal,f=b.getComputedStyle(a);return d.test(f.overflow+f.overflowY+f.overflowX)},scrollParent:function(c,d,f){c=this.getRawNode(c);var g=d?e.hidden:e.normal,h=a[0].documentElement,i=b.getComputedStyle(c);if(f&&g.test(i.overflow+i.overflowY+i.overflowX))return c;var j="absolute"===i.position,k=c.parentElement||h;if(k===h||"fixed"===i.position)return h;for(;k.parentElement&&k!==h;){var l=b.getComputedStyle(k);if(j&&"static"!==l.position&&(j=!1),!j&&g.test(l.overflow+l.overflowY+l.overflowX))break;k=k.parentElement}return k},position:function(c,d){c=this.getRawNode(c);var e=this.offset(c);if(d){var f=b.getComputedStyle(c);e.top-=this.parseStyle(f.marginTop),e.left-=this.parseStyle(f.marginLeft)}var g=this.offsetParent(c),h={top:0,left:0};return g!==a[0].documentElement&&(h=this.offset(g),h.top+=g.clientTop-g.scrollTop,h.left+=g.clientLeft-g.scrollLeft),{width:Math.round(angular.isNumber(e.width)?e.width:c.offsetWidth),height:Math.round(angular.isNumber(e.height)?e.height:c.offsetHeight),top:Math.round(e.top-h.top),left:Math.round(e.left-h.left)}},offset:function(c){c=this.getRawNode(c);var d=c.getBoundingClientRect();return{width:Math.round(angular.isNumber(d.width)?d.width:c.offsetWidth),height:Math.round(angular.isNumber(d.height)?d.height:c.offsetHeight),top:Math.round(d.top+(b.pageYOffset||a[0].documentElement.scrollTop)),left:Math.round(d.left+(b.pageXOffset||a[0].documentElement.scrollLeft))}},viewportOffset:function(c,d,e){c=this.getRawNode(c),e=e!==!1;var f=c.getBoundingClientRect(),g={top:0,left:0,bottom:0,right:0},h=d?a[0].documentElement:this.scrollParent(c),i=h.getBoundingClientRect();if(g.top=i.top+h.clientTop,g.left=i.left+h.clientLeft,h===a[0].documentElement&&(g.top+=b.pageYOffset,g.left+=b.pageXOffset),g.bottom=g.top+h.clientHeight,g.right=g.left+h.clientWidth,e){var j=b.getComputedStyle(h);g.top+=this.parseStyle(j.paddingTop),g.bottom-=this.parseStyle(j.paddingBottom),g.left+=this.parseStyle(j.paddingLeft),g.right-=this.parseStyle(j.paddingRight)}return{top:Math.round(f.top-g.top),bottom:Math.round(g.bottom-f.bottom),left:Math.round(f.left-g.left),right:Math.round(g.right-f.right)}},parsePlacement:function(a){var b=f.auto.test(a);return b&&(a=a.replace(f.auto,"")),a=a.split("-"),a[0]=a[0]||"top",f.primary.test(a[0])||(a[0]="top"),a[1]=a[1]||"center",f.secondary.test(a[1])||(a[1]="center"),b?a[2]=!0:a[2]=!1,a},positionElements:function(a,c,d,e){a=this.getRawNode(a),c=this.getRawNode(c);var g=angular.isDefined(c.offsetWidth)?c.offsetWidth:c.prop("offsetWidth"),h=angular.isDefined(c.offsetHeight)?c.offsetHeight:c.prop("offsetHeight");d=this.parsePlacement(d);var i=e?this.offset(a):this.position(a),j={top:0,left:0,placement:""};if(d[2]){var k=this.viewportOffset(a,e),l=b.getComputedStyle(c),m={width:g+Math.round(Math.abs(this.parseStyle(l.marginLeft)+this.parseStyle(l.marginRight))),height:h+Math.round(Math.abs(this.parseStyle(l.marginTop)+this.parseStyle(l.marginBottom)))};if(d[0]="top"===d[0]&&m.height>k.top&&m.height<=k.bottom?"bottom":"bottom"===d[0]&&m.height>k.bottom&&m.height<=k.top?"top":"left"===d[0]&&m.width>k.left&&m.width<=k.right?"right":"right"===d[0]&&m.width>k.right&&m.width<=k.left?"left":d[0],d[1]="top"===d[1]&&m.height-i.height>k.bottom&&m.height-i.height<=k.top?"bottom":"bottom"===d[1]&&m.height-i.height>k.top&&m.height-i.height<=k.bottom?"top":"left"===d[1]&&m.width-i.width>k.right&&m.width-i.width<=k.left?"right":"right"===d[1]&&m.width-i.width>k.left&&m.width-i.width<=k.right?"left":d[1],"center"===d[1])if(f.vertical.test(d[0])){var n=i.width/2-g/2;k.left+n<0&&m.width-i.width<=k.right?d[1]="left":k.right+n<0&&m.width-i.width<=k.left&&(d[1]="right")}else{var o=i.height/2-m.height/2;k.top+o<0&&m.height-i.height<=k.bottom?d[1]="top":k.bottom+o<0&&m.height-i.height<=k.top&&(d[1]="bottom")}}switch(d[0]){case"top":j.top=i.top-h;break;case"bottom":j.top=i.top+i.height;break;case"left":j.left=i.left-g;break;case"right":j.left=i.left+i.width}switch(d[1]){case"top":j.top=i.top;break;case"bottom":j.top=i.top+i.height-h;break;case"left":j.left=i.left;break;case"right":j.left=i.left+i.width-g;break;case"center":f.vertical.test(d[0])?j.left=i.left+i.width/2-g/2:j.top=i.top+i.height/2-h/2}return j.top=Math.round(j.top),j.left=Math.round(j.left),j.placement="center"===d[1]?d[0]:d[0]+"-"+d[1],j},adjustTop:function(a,b,c,d){return-1!==a.indexOf("top")&&c!==d?{top:b.top-d+"px"}:void 0},positionArrow:function(a,c){a=this.getRawNode(a);var d=a.querySelector(".tooltip-inner, .popover-inner");if(d){var e=angular.element(d).hasClass("tooltip-inner"),g=e?a.querySelector(".tooltip-arrow"):a.querySelector(".arrow");if(g){var h={top:"",bottom:"",left:"",right:""};if(c=this.parsePlacement(c),"center"===c[1])return void angular.element(g).css(h);var i="border-"+c[0]+"-width",j=b.getComputedStyle(g)[i],k="border-";k+=f.vertical.test(c[0])?c[0]+"-"+c[1]:c[1]+"-"+c[0],k+="-radius";var l=b.getComputedStyle(e?d:a)[k];switch(c[0]){case"top":h.bottom=e?"0":"-"+j;break;case"bottom":h.top=e?"0":"-"+j;break;case"left":h.right=e?"0":"-"+j;break;case"right":h.left=e?"0":"-"+j}h[c[1]]=l,angular.element(g).css(h)}}}}}]),angular.module("ui.bootstrap.datepickerPopup",["ui.bootstrap.datepicker","ui.bootstrap.position"]).value("$datepickerPopupLiteralWarning",!0).constant("uibDatepickerPopupConfig",{altInputFormats:[],appendToBody:!1,clearText:"Clear",closeOnDateSelection:!0,closeText:"Done",currentText:"Today",datepickerPopup:"yyyy-MM-dd",datepickerPopupTemplateUrl:"uib/template/datepickerPopup/popup.html",datepickerTemplateUrl:"uib/template/datepicker/datepicker.html",html5Types:{date:"yyyy-MM-dd","datetime-local":"yyyy-MM-ddTHH:mm:ss.sss",month:"yyyy-MM"},onOpenFocus:!0,showButtonBar:!0,placement:"auto bottom-left"}).controller("UibDatepickerPopupController",["$scope","$element","$attrs","$compile","$log","$parse","$window","$document","$rootScope","$uibPosition","dateFilter","uibDateParser","uibDatepickerPopupConfig","$timeout","uibDatepickerConfig","$datepickerPopupLiteralWarning",function(a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p){function q(b){var c=l.parse(b,x,a.date);if(isNaN(c))for(var d=0;d<J.length;d++)if(c=l.parse(b,J[d],a.date),!isNaN(c))return c;return c}function r(a){if(angular.isNumber(a)&&(a=new Date(a)),!a)return null;if(angular.isDate(a)&&!isNaN(a))return a;if(angular.isString(a)){var b=q(a);if(!isNaN(b))return l.toTimezone(b,H.getOption("timezone"))}return H.getOption("allowInvalid")?a:void 0}function s(a,b){var d=a||b;return c.ngRequired||d?(angular.isNumber(d)&&(d=new Date(d)),d?angular.isDate(d)&&!isNaN(d)?!0:angular.isString(d)?!isNaN(q(d)):!1:!0):!0}function t(c){if(a.isOpen||!a.disabled){var d=I[0],e=b[0].contains(c.target),f=void 0!==d.contains&&d.contains(c.target);!a.isOpen||e||f||a.$apply(function(){a.isOpen=!1})}}function u(c){27===c.which&&a.isOpen?(c.preventDefault(),c.stopPropagation(),a.$apply(function(){a.isOpen=!1}),b[0].focus()):40!==c.which||a.isOpen||(c.preventDefault(),c.stopPropagation(),a.$apply(function(){a.isOpen=!0}))}function v(){if(a.isOpen){var d=angular.element(I[0].querySelector(".uib-datepicker-popup")),e=c.popupPlacement?c.popupPlacement:m.placement,f=j.positionElements(b,d,e,z);d.css({top:f.top+"px",left:f.left+"px"}),d.hasClass("uib-position-measure")&&d.removeClass("uib-position-measure")}}function w(a){var b;return angular.version.minor<6?(b=angular.isObject(a.$options)?a.$options:{timezone:null},b.getOption=function(a){return b[a]}):b=a.$options,b}var x,y,z,A,B,C,D,E,F,G,H,I,J,K=!1,L=[];this.init=function(e){if(G=e,H=w(G),y=angular.isDefined(c.closeOnDateSelection)?a.$parent.$eval(c.closeOnDateSelection):m.closeOnDateSelection,z=angular.isDefined(c.datepickerAppendToBody)?a.$parent.$eval(c.datepickerAppendToBody):m.appendToBody,A=angular.isDefined(c.onOpenFocus)?a.$parent.$eval(c.onOpenFocus):m.onOpenFocus,B=angular.isDefined(c.datepickerPopupTemplateUrl)?c.datepickerPopupTemplateUrl:m.datepickerPopupTemplateUrl,C=angular.isDefined(c.datepickerTemplateUrl)?c.datepickerTemplateUrl:m.datepickerTemplateUrl,J=angular.isDefined(c.altInputFormats)?a.$parent.$eval(c.altInputFormats):m.altInputFormats,a.showButtonBar=angular.isDefined(c.showButtonBar)?a.$parent.$eval(c.showButtonBar):m.showButtonBar,m.html5Types[c.type]?(x=m.html5Types[c.type],K=!0):(x=c.uibDatepickerPopup||m.datepickerPopup,c.$observe("uibDatepickerPopup",function(a,b){var c=a||m.datepickerPopup;if(c!==x&&(x=c,G.$modelValue=null,!x))throw new Error("uibDatepickerPopup must have a date format specified.")})),!x)throw new Error("uibDatepickerPopup must have a date format specified.");if(K&&c.uibDatepickerPopup)throw new Error("HTML5 date input types do not support custom formats.");D=angular.element("<div uib-datepicker-popup-wrap><div uib-datepicker></div></div>"),D.attr({"ng-model":"date","ng-change":"dateSelection(date)","template-url":B}),E=angular.element(D.children()[0]),E.attr("template-url",C),a.datepickerOptions||(a.datepickerOptions={}),K&&"month"===c.type&&(a.datepickerOptions.datepickerMode="month",a.datepickerOptions.minMode="month"),E.attr("datepicker-options","datepickerOptions"),K?G.$formatters.push(function(b){return a.date=l.fromTimezone(b,H.getOption("timezone")),b}):(G.$$parserName="date",G.$validators.date=s,G.$parsers.unshift(r),G.$formatters.push(function(b){return G.$isEmpty(b)?(a.date=b,b):(angular.isNumber(b)&&(b=new Date(b)),a.date=l.fromTimezone(b,H.getOption("timezone")),l.filter(a.date,x))})),G.$viewChangeListeners.push(function(){a.date=q(G.$viewValue)}),b.on("keydown",u),I=d(D)(a),D.remove(),z?h.find("body").append(I):b.after(I),a.$on("$destroy",function(){for(a.isOpen===!0&&(i.$$phase||a.$apply(function(){a.isOpen=!1})),I.remove(),b.off("keydown",u),h.off("click",t),F&&F.off("scroll",v),angular.element(g).off("resize",v);L.length;)L.shift()()})},a.getText=function(b){return a[b+"Text"]||m[b+"Text"]},a.isDisabled=function(b){"today"===b&&(b=l.fromTimezone(new Date,H.getOption("timezone")));var c={};return angular.forEach(["minDate","maxDate"],function(b){a.datepickerOptions[b]?angular.isDate(a.datepickerOptions[b])?c[b]=new Date(a.datepickerOptions[b]):(p&&e.warn("Literal date support has been deprecated, please switch to date object usage"),c[b]=new Date(k(a.datepickerOptions[b],"medium"))):c[b]=null}),a.datepickerOptions&&c.minDate&&a.compare(b,c.minDate)<0||c.maxDate&&a.compare(b,c.maxDate)>0},a.compare=function(a,b){return new Date(a.getFullYear(),a.getMonth(),a.getDate())-new Date(b.getFullYear(),b.getMonth(),b.getDate())},a.dateSelection=function(c){a.date=c;var d=a.date?l.filter(a.date,x):null;b.val(d),G.$setViewValue(d),y&&(a.isOpen=!1,b[0].focus())},a.keydown=function(c){27===c.which&&(c.stopPropagation(),a.isOpen=!1,b[0].focus())},a.select=function(b,c){if(c.stopPropagation(),"today"===b){var d=new Date;angular.isDate(a.date)?(b=new Date(a.date),b.setFullYear(d.getFullYear(),d.getMonth(),d.getDate())):(b=l.fromTimezone(d,H.getOption("timezone")),b.setHours(0,0,0,0))}a.dateSelection(b)},a.close=function(c){c.stopPropagation(),a.isOpen=!1,b[0].focus()},a.disabled=angular.isDefined(c.disabled)||!1,c.ngDisabled&&L.push(a.$parent.$watch(f(c.ngDisabled),function(b){a.disabled=b})),a.$watch("isOpen",function(d){d?a.disabled?a.isOpen=!1:n(function(){v(),A&&a.$broadcast("uib:datepicker.focus"),h.on("click",t);var d=c.popupPlacement?c.popupPlacement:m.placement;z||j.parsePlacement(d)[2]?(F=F||angular.element(j.scrollParent(b)),F&&F.on("scroll",v)):F=null,angular.element(g).on("resize",v)},0,!1):(h.off("click",t),F&&F.off("scroll",v),angular.element(g).off("resize",v))}),a.$on("uib:datepicker.mode",function(){n(v,0,!1)})}]).directive("uibDatepickerPopup",function(){return{require:["ngModel","uibDatepickerPopup"],controller:"UibDatepickerPopupController",scope:{datepickerOptions:"=?",isOpen:"=?",currentText:"@",clearText:"@",closeText:"@"},link:function(a,b,c,d){var e=d[0],f=d[1];f.init(e)}}}).directive("uibDatepickerPopupWrap",function(){return{restrict:"A",transclude:!0,templateUrl:function(a,b){return b.templateUrl||"uib/template/datepickerPopup/popup.html"}}}),angular.module("ui.bootstrap.debounce",[]).factory("$$debounce",["$timeout",function(a){return function(b,c){var d;return function(){var e=this,f=Array.prototype.slice.call(arguments);d&&a.cancel(d),d=a(function(){b.apply(e,f)},c)}}}]),angular.module("ui.bootstrap.multiMap",[]).factory("$$multiMap",function(){return{createNew:function(){var a={};return{entries:function(){return Object.keys(a).map(function(b){return{key:b,value:a[b]}})},get:function(b){return a[b]},hasKey:function(b){return!!a[b]},keys:function(){return Object.keys(a)},put:function(b,c){a[b]||(a[b]=[]),a[b].push(c)},remove:function(b,c){var d=a[b];if(d){var e=d.indexOf(c);-1!==e&&d.splice(e,1),d.length||delete a[b]}}}}}}),angular.module("ui.bootstrap.dropdown",["ui.bootstrap.multiMap","ui.bootstrap.position"]).constant("uibDropdownConfig",{appendToOpenClass:"uib-dropdown-open",openClass:"open"}).service("uibDropdownService",["$document","$rootScope","$$multiMap",function(a,b,c){var d=null,e=c.createNew();this.isOnlyOpen=function(a,b){var c=e.get(b);if(c){var d=c.reduce(function(b,c){return c.scope===a?c:b},{});if(d)return 1===c.length}return!1},this.open=function(b,c,g){if(d||a.on("click",f),d&&d!==b&&(d.isOpen=!1),d=b,g){var h=e.get(g);if(h){var i=h.map(function(a){return a.scope});-1===i.indexOf(b)&&e.put(g,{scope:b})}else e.put(g,{scope:b})}},this.close=function(b,c,g){if(d===b&&(a.off("click",f),a.off("keydown",this.keybindFilter),d=null),g){var h=e.get(g);if(h){var i=h.reduce(function(a,c){return c.scope===b?c:a},{});i&&e.remove(g,i)}}};var f=function(a){if(d&&d.isOpen&&!(a&&"disabled"===d.getAutoClose()||a&&3===a.which)){var c=d.getToggleElement();if(!(a&&c&&c[0].contains(a.target))){var e=d.getDropdownElement();a&&"outsideClick"===d.getAutoClose()&&e&&e[0].contains(a.target)||(d.focusToggleElement(),d.isOpen=!1,b.$$phase||d.$apply())}}};this.keybindFilter=function(a){if(d){var b=d.getDropdownElement(),c=d.getToggleElement(),e=b&&b[0].contains(a.target),g=c&&c[0].contains(a.target);27===a.which?(a.stopPropagation(),d.focusToggleElement(),f()):d.isKeynavEnabled()&&-1!==[38,40].indexOf(a.which)&&d.isOpen&&(e||g)&&(a.preventDefault(),a.stopPropagation(),d.focusDropdownEntry(a.which))}}}]).controller("UibDropdownController",["$scope","$element","$attrs","$parse","uibDropdownConfig","uibDropdownService","$animate","$uibPosition","$document","$compile","$templateRequest",function(a,b,c,d,e,f,g,h,i,j,k){function l(){b.append(o.dropdownMenu)}var m,n,o=this,p=a.$new(),q=e.appendToOpenClass,r=e.openClass,s=angular.noop,t=c.onToggle?d(c.onToggle):angular.noop,u=!1,v=i.find("body");b.addClass("dropdown"),this.init=function(){c.isOpen&&(n=d(c.isOpen),s=n.assign,a.$watch(n,function(a){p.isOpen=!!a})),u=angular.isDefined(c.keyboardNav)},this.toggle=function(a){return p.isOpen=arguments.length?!!a:!p.isOpen,angular.isFunction(s)&&s(p,p.isOpen),p.isOpen},this.isOpen=function(){return p.isOpen},p.getToggleElement=function(){return o.toggleElement},p.getAutoClose=function(){return c.autoClose||"always"},p.getElement=function(){return b},p.isKeynavEnabled=function(){return u},p.focusDropdownEntry=function(a){var c=o.dropdownMenu?angular.element(o.dropdownMenu).find("a"):b.find("ul").eq(0).find("a");switch(a){case 40:angular.isNumber(o.selectedOption)?o.selectedOption=o.selectedOption===c.length-1?o.selectedOption:o.selectedOption+1:o.selectedOption=0;break;case 38:angular.isNumber(o.selectedOption)?o.selectedOption=0===o.selectedOption?0:o.selectedOption-1:o.selectedOption=c.length-1}c[o.selectedOption].focus()},p.getDropdownElement=function(){return o.dropdownMenu},p.focusToggleElement=function(){o.toggleElement&&o.toggleElement[0].focus()},p.$watch("isOpen",function(e,n){var u=null,w=!1;if(angular.isDefined(c.dropdownAppendTo)){var x=d(c.dropdownAppendTo)(p);x&&(u=angular.element(x))}if(angular.isDefined(c.dropdownAppendToBody)){var y=d(c.dropdownAppendToBody)(p);y!==!1&&(w=!0)}if(w&&!u&&(u=v),u&&o.dropdownMenu&&(e?(u.append(o.dropdownMenu),b.on("$destroy",l)):(b.off("$destroy",l),l())),u&&o.dropdownMenu){var z,A,B,C=h.positionElements(b,o.dropdownMenu,"bottom-left",!0),D=0;if(z={top:C.top+"px",display:e?"block":"none"},A=o.dropdownMenu.hasClass("dropdown-menu-right"),A?(z.left="auto",B=h.scrollbarPadding(u),B.heightOverflow&&B.scrollbarWidth&&(D=B.scrollbarWidth),z.right=window.innerWidth-D-(C.left+b.prop("offsetWidth"))+"px"):(z.left=C.left+"px",z.right="auto"),!w){var E=h.offset(u);z.top=C.top-E.top+"px",A?z.right=window.innerWidth-(C.left-E.left+b.prop("offsetWidth"))+"px":z.left=C.left-E.left+"px"}o.dropdownMenu.css(z)}var F=u?u:b,G=u?q:r,H=F.hasClass(G),I=f.isOnlyOpen(a,u);if(H===!e){var J;J=u?I?"removeClass":"addClass":e?"addClass":"removeClass",g[J](F,G).then(function(){angular.isDefined(e)&&e!==n&&t(a,{open:!!e})})}if(e)o.dropdownMenuTemplateUrl?k(o.dropdownMenuTemplateUrl).then(function(a){m=p.$new(),j(a.trim())(m,function(a){var b=a;o.dropdownMenu.replaceWith(b),o.dropdownMenu=b,i.on("keydown",f.keybindFilter)})}):i.on("keydown",f.keybindFilter),p.focusToggleElement(),f.open(p,b,u);else{if(f.close(p,b,u),o.dropdownMenuTemplateUrl){m&&m.$destroy();var K=angular.element('<ul class="dropdown-menu"></ul>');o.dropdownMenu.replaceWith(K),o.dropdownMenu=K}o.selectedOption=null}angular.isFunction(s)&&s(a,e)})}]).directive("uibDropdown",function(){return{controller:"UibDropdownController",link:function(a,b,c,d){d.init()}}}).directive("uibDropdownMenu",function(){return{restrict:"A",require:"?^uibDropdown",link:function(a,b,c,d){if(d&&!angular.isDefined(c.dropdownNested)){b.addClass("dropdown-menu");var e=c.templateUrl;e&&(d.dropdownMenuTemplateUrl=e),d.dropdownMenu||(d.dropdownMenu=b)}}}}).directive("uibDropdownToggle",function(){return{require:"?^uibDropdown",link:function(a,b,c,d){if(d){b.addClass("dropdown-toggle"),d.toggleElement=b;var e=function(e){e.preventDefault(),b.hasClass("disabled")||c.disabled||a.$apply(function(){d.toggle()})};b.on("click",e),b.attr({"aria-haspopup":!0,"aria-expanded":!1}),a.$watch(d.isOpen,function(a){b.attr("aria-expanded",!!a)}),a.$on("$destroy",function(){b.off("click",e)})}}}}),angular.module("ui.bootstrap.stackedMap",[]).factory("$$stackedMap",function(){return{createNew:function(){var a=[];return{add:function(b,c){a.push({key:b,value:c})},get:function(b){for(var c=0;c<a.length;c++)if(b===a[c].key)return a[c]},keys:function(){for(var b=[],c=0;c<a.length;c++)b.push(a[c].key);return b},top:function(){return a[a.length-1]},remove:function(b){for(var c=-1,d=0;d<a.length;d++)if(b===a[d].key){c=d;break}return a.splice(c,1)[0]},removeTop:function(){return a.pop()},length:function(){return a.length}}}}}),angular.module("ui.bootstrap.modal",["ui.bootstrap.multiMap","ui.bootstrap.stackedMap","ui.bootstrap.position"]).provider("$uibResolve",function(){var a=this;this.resolver=null,this.setResolver=function(a){this.resolver=a},this.$get=["$injector","$q",function(b,c){var d=a.resolver?b.get(a.resolver):null;return{resolve:function(a,e,f,g){if(d)return d.resolve(a,e,f,g);var h=[];return angular.forEach(a,function(a){angular.isFunction(a)||angular.isArray(a)?h.push(c.resolve(b.invoke(a))):angular.isString(a)?h.push(c.resolve(b.get(a))):h.push(c.resolve(a))}),c.all(h).then(function(b){var c={},d=0;return angular.forEach(a,function(a,e){c[e]=b[d++]}),c})}}}]}).directive("uibModalBackdrop",["$animate","$injector","$uibModalStack",function(a,b,c){function d(b,d,e){e.modalInClass&&(a.addClass(d,e.modalInClass),b.$on(c.NOW_CLOSING_EVENT,function(c,f){var g=f();b.modalOptions.animation?a.removeClass(d,e.modalInClass).then(g):g()}))}return{restrict:"A",compile:function(a,b){return a.addClass(b.backdropClass),d}}}]).directive("uibModalWindow",["$uibModalStack","$q","$animateCss","$document",function(a,b,c,d){return{scope:{index:"@"},restrict:"A",transclude:!0,templateUrl:function(a,b){return b.templateUrl||"uib/template/modal/window.html"},link:function(e,f,g){f.addClass(g.windowTopClass||""),e.size=g.size,e.close=function(b){var c=a.getTop();c&&c.value.backdrop&&"static"!==c.value.backdrop&&b.target===b.currentTarget&&(b.preventDefault(),b.stopPropagation(),a.dismiss(c.key,"backdrop click"))},f.on("click",e.close),e.$isRendered=!0;var h=b.defer();e.$$postDigest(function(){h.resolve()}),h.promise.then(function(){var h=null;g.modalInClass&&(h=c(f,{addClass:g.modalInClass}).start(),e.$on(a.NOW_CLOSING_EVENT,function(a,b){var d=b();c(f,{removeClass:g.modalInClass}).start().then(d)})),b.when(h).then(function(){var b=a.getTop();if(b&&a.modalRendered(b.key),!d[0].activeElement||!f[0].contains(d[0].activeElement)){var c=f[0].querySelector("[autofocus]");c?c.focus():f[0].focus()}})})}}}]).directive("uibModalAnimationClass",function(){return{compile:function(a,b){b.modalAnimation&&a.addClass(b.uibModalAnimationClass)}}}).directive("uibModalTransclude",["$animate",function(a){return{link:function(b,c,d,e,f){f(b.$parent,function(b){c.empty(),a.enter(b,c)})}}}]).factory("$uibModalStack",["$animate","$animateCss","$document","$compile","$rootScope","$q","$$multiMap","$$stackedMap","$uibPosition",function(a,b,c,d,e,f,g,h,i){function j(a){var b="-";return a.replace(E,function(a,c){return(c?b:"")+a.toLowerCase()})}function k(a){return!!(a.offsetWidth||a.offsetHeight||a.getClientRects().length)}function l(){for(var a=-1,b=x.keys(),c=0;c<b.length;c++)x.get(b[c]).value.backdrop&&(a=c);return a>-1&&A>a&&(a=A),a}function m(a,b){var c=x.get(a).value,d=c.appendTo;x.remove(a),B=x.top(),B&&(A=parseInt(B.value.modalDomEl.attr("index"),10)),p(c.modalDomEl,c.modalScope,function(){var b=c.openedClass||w;y.remove(b,a);var e=y.hasKey(b);d.toggleClass(b,e),!e&&v&&v.heightOverflow&&v.scrollbarWidth&&(v.originalRight?d.css({paddingRight:v.originalRight+"px"}):d.css({paddingRight:""}),v=null),n(!0)},c.closedDeferred),o(),b&&b.focus?b.focus():d.focus&&d.focus()}function n(a){var b;x.length()>0&&(b=x.top().value,b.modalDomEl.toggleClass(b.windowTopClass||"",a))}function o(){if(t&&-1===l()){var a=u;p(t,u,function(){a=null}),t=void 0,u=void 0}}function p(b,c,d,e){function g(){g.done||(g.done=!0,a.leave(b).then(function(){d&&d(),b.remove(),e&&e.resolve()}),c.$destroy())}var h,i=null,j=function(){return h||(h=f.defer(),i=h.promise),function(){h.resolve()}};return c.$broadcast(z.NOW_CLOSING_EVENT,j),f.when(i).then(g)}function q(a){if(a.isDefaultPrevented())return a;var b=x.top();if(b)switch(a.which){case 27:b.value.keyboard&&(a.preventDefault(),e.$apply(function(){z.dismiss(b.key,"escape key press")}));break;case 9:var c=z.loadFocusElementList(b),d=!1;a.shiftKey?(z.isFocusInFirstItem(a,c)||z.isModalFocused(a,b))&&(d=z.focusLastFocusableElement(c)):z.isFocusInLastItem(a,c)&&(d=z.focusFirstFocusableElement(c)),d&&(a.preventDefault(),a.stopPropagation())}}function r(a,b,c){return!a.value.modalScope.$broadcast("modal.closing",b,c).defaultPrevented}function s(){Array.prototype.forEach.call(document.querySelectorAll("["+C+"]"),function(a){var b=parseInt(a.getAttribute(C),10),c=b-1;a.setAttribute(C,c),c||(a.removeAttribute(C),a.removeAttribute("aria-hidden"))})}var t,u,v,w="modal-open",x=h.createNew(),y=g.createNew(),z={NOW_CLOSING_EVENT:"modal.stack.now-closing"},A=0,B=null,C="data-bootstrap-modal-aria-hidden-count",D="a[href], area[href], input:not([disabled]):not([tabindex='-1']), button:not([disabled]):not([tabindex='-1']),select:not([disabled]):not([tabindex='-1']), textarea:not([disabled]):not([tabindex='-1']), iframe, object, embed, *[tabindex]:not([tabindex='-1']), *[contenteditable=true]",E=/[A-Z]/g;return e.$watch(l,function(a){u&&(u.index=a)}),c.on("keydown",q),e.$on("$destroy",function(){c.off("keydown",q)}),z.open=function(b,f){function g(a){function b(a){var b=a.parent()?a.parent().children():[];return Array.prototype.filter.call(b,function(b){return b!==a[0]})}if(a&&"BODY"!==a[0].tagName)return b(a).forEach(function(a){var b="true"===a.getAttribute("aria-hidden"),c=parseInt(a.getAttribute(C),10);c||(c=b?1:0),a.setAttribute(C,c+1),a.setAttribute("aria-hidden","true")}),g(a.parent())}var h=c[0].activeElement,k=f.openedClass||w;n(!1),B=x.top(),x.add(b,{deferred:f.deferred,renderDeferred:f.renderDeferred,closedDeferred:f.closedDeferred,modalScope:f.scope,backdrop:f.backdrop,keyboard:f.keyboard,openedClass:f.openedClass,windowTopClass:f.windowTopClass,animation:f.animation,appendTo:f.appendTo}),y.put(k,b);var m=f.appendTo,o=l();o>=0&&!t&&(u=e.$new(!0),u.modalOptions=f,u.index=o,t=angular.element('<div uib-modal-backdrop="modal-backdrop"></div>'),t.attr({"class":"modal-backdrop","ng-style":"{'z-index': 1040 + (index && 1 || 0) + index*10}","uib-modal-animation-class":"fade","modal-in-class":"in"}),f.backdropClass&&t.addClass(f.backdropClass),f.animation&&t.attr("modal-animation","true"),d(t)(u),a.enter(t,m),i.isScrollable(m)&&(v=i.scrollbarPadding(m),v.heightOverflow&&v.scrollbarWidth&&m.css({paddingRight:v.right+"px"})));var p;f.component?(p=document.createElement(j(f.component.name)),p=angular.element(p),p.attr({resolve:"$resolve","modal-instance":"$uibModalInstance",close:"$close($value)",dismiss:"$dismiss($value)"})):p=f.content,A=B?parseInt(B.value.modalDomEl.attr("index"),10)+1:0;var q=angular.element('<div uib-modal-window="modal-window"></div>');q.attr({"class":"modal","template-url":f.windowTemplateUrl,"window-top-class":f.windowTopClass,role:"dialog","aria-labelledby":f.ariaLabelledBy,"aria-describedby":f.ariaDescribedBy,size:f.size,index:A,animate:"animate","ng-style":"{'z-index': 1050 + $$topModalIndex*10, display: 'block'}",tabindex:-1,"uib-modal-animation-class":"fade","modal-in-class":"in"}).append(p),f.windowClass&&q.addClass(f.windowClass),f.animation&&q.attr("modal-animation","true"),m.addClass(k),f.scope&&(f.scope.$$topModalIndex=A),a.enter(d(q)(f.scope),m),x.top().value.modalDomEl=q,x.top().value.modalOpener=h,g(q)},z.close=function(a,b){var c=x.get(a);return s(),c&&r(c,b,!0)?(c.value.modalScope.$$uibDestructionScheduled=!0,c.value.deferred.resolve(b),m(a,c.value.modalOpener),!0):!c},z.dismiss=function(a,b){var c=x.get(a);return s(),c&&r(c,b,!1)?(c.value.modalScope.$$uibDestructionScheduled=!0,c.value.deferred.reject(b),m(a,c.value.modalOpener),!0):!c},z.dismissAll=function(a){for(var b=this.getTop();b&&this.dismiss(b.key,a);)b=this.getTop()},z.getTop=function(){return x.top()},z.modalRendered=function(a){var b=x.get(a);b&&b.value.renderDeferred.resolve()},z.focusFirstFocusableElement=function(a){return a.length>0?(a[0].focus(),!0):!1},z.focusLastFocusableElement=function(a){return a.length>0?(a[a.length-1].focus(),!0):!1},z.isModalFocused=function(a,b){if(a&&b){var c=b.value.modalDomEl;if(c&&c.length)return(a.target||a.srcElement)===c[0]}return!1},z.isFocusInFirstItem=function(a,b){return b.length>0?(a.target||a.srcElement)===b[0]:!1},z.isFocusInLastItem=function(a,b){return b.length>0?(a.target||a.srcElement)===b[b.length-1]:!1},z.loadFocusElementList=function(a){if(a){var b=a.value.modalDomEl;if(b&&b.length){var c=b[0].querySelectorAll(D);return c?Array.prototype.filter.call(c,function(a){return k(a)}):c}}},z}]).provider("$uibModal",function(){var a={options:{animation:!0,backdrop:!0,keyboard:!0},$get:["$rootScope","$q","$document","$templateRequest","$controller","$uibResolve","$uibModalStack",function(b,c,d,e,f,g,h){function i(a){return a.template?c.when(a.template):e(angular.isFunction(a.templateUrl)?a.templateUrl():a.templateUrl)}var j={},k=null;return j.getPromiseChain=function(){return k},j.open=function(e){function j(){return q}var l=c.defer(),m=c.defer(),n=c.defer(),o=c.defer(),p={result:l.promise,opened:m.promise,closed:n.promise,rendered:o.promise,close:function(a){return h.close(p,a)},dismiss:function(a){return h.dismiss(p,a)}};if(e=angular.extend({},a.options,e),e.resolve=e.resolve||{},e.appendTo=e.appendTo||d.find("body").eq(0),!e.appendTo.length)throw new Error("appendTo element not found. Make sure that the element passed is in DOM.");if(!e.component&&!e.template&&!e.templateUrl)throw new Error("One of component or template or templateUrl options is required.");var q;q=e.component?c.when(g.resolve(e.resolve,{},null,null)):c.all([i(e),g.resolve(e.resolve,{},null,null)]);var r;return r=k=c.all([k]).then(j,j).then(function(a){function c(b,c,d,e){b.$scope=g,b.$scope.$resolve={},d?b.$scope.$uibModalInstance=p:b.$uibModalInstance=p;var f=c?a[1]:a;angular.forEach(f,function(a,c){e&&(b[c]=a),b.$scope.$resolve[c]=a})}var d=e.scope||b,g=d.$new();g.$close=p.close,g.$dismiss=p.dismiss,g.$on("$destroy",function(){g.$$uibDestructionScheduled||g.$dismiss("$uibUnscheduledDestruction")});var i,j,k={scope:g,deferred:l,renderDeferred:o,closedDeferred:n,animation:e.animation,backdrop:e.backdrop,keyboard:e.keyboard,backdropClass:e.backdropClass,windowTopClass:e.windowTopClass,windowClass:e.windowClass,windowTemplateUrl:e.windowTemplateUrl,ariaLabelledBy:e.ariaLabelledBy,ariaDescribedBy:e.ariaDescribedBy,size:e.size,openedClass:e.openedClass,appendTo:e.appendTo},q={},r={};e.component?(c(q,!1,!0,!1),q.name=e.component,k.component=q):e.controller&&(c(r,!0,!1,!0),j=f(e.controller,r,!0,e.controllerAs),e.controllerAs&&e.bindToController&&(i=j.instance,i.$close=g.$close,i.$dismiss=g.$dismiss,angular.extend(i,{$resolve:r.$scope.$resolve},d)),i=j(),angular.isFunction(i.$onInit)&&i.$onInit()),e.component||(k.content=a[0]),h.open(p,k),m.resolve(!0)},function(a){m.reject(a),l.reject(a)})["finally"](function(){k===r&&(k=null)}),p},j}]};return a}),angular.module("ui.bootstrap.paging",[]).factory("uibPaging",["$parse",function(a){return{create:function(b,c,d){b.setNumPages=d.numPages?a(d.numPages).assign:angular.noop,b.ngModelCtrl={$setViewValue:angular.noop},b._watchers=[],b.init=function(a,e){b.ngModelCtrl=a,b.config=e,a.$render=function(){b.render()},d.itemsPerPage?b._watchers.push(c.$parent.$watch(d.itemsPerPage,function(a){
b.itemsPerPage=parseInt(a,10),c.totalPages=b.calculateTotalPages(),b.updatePage()})):b.itemsPerPage=e.itemsPerPage,c.$watch("totalItems",function(a,d){(angular.isDefined(a)||a!==d)&&(c.totalPages=b.calculateTotalPages(),b.updatePage())})},b.calculateTotalPages=function(){var a=b.itemsPerPage<1?1:Math.ceil(c.totalItems/b.itemsPerPage);return Math.max(a||0,1)},b.render=function(){c.page=parseInt(b.ngModelCtrl.$viewValue,10)||1},c.selectPage=function(a,d){d&&d.preventDefault();var e=!c.ngDisabled||!d;e&&c.page!==a&&a>0&&a<=c.totalPages&&(d&&d.target&&d.target.blur(),b.ngModelCtrl.$setViewValue(a),b.ngModelCtrl.$render())},c.getText=function(a){return c[a+"Text"]||b.config[a+"Text"]},c.noPrevious=function(){return 1===c.page},c.noNext=function(){return c.page===c.totalPages},b.updatePage=function(){b.setNumPages(c.$parent,c.totalPages),c.page>c.totalPages?c.selectPage(c.totalPages):b.ngModelCtrl.$render()},c.$on("$destroy",function(){for(;b._watchers.length;)b._watchers.shift()()})}}}]),angular.module("ui.bootstrap.pager",["ui.bootstrap.paging","ui.bootstrap.tabindex"]).controller("UibPagerController",["$scope","$attrs","uibPaging","uibPagerConfig",function(a,b,c,d){a.align=angular.isDefined(b.align)?a.$parent.$eval(b.align):d.align,c.create(this,a,b)}]).constant("uibPagerConfig",{itemsPerPage:10,previousText:"« Previous",nextText:"Next »",align:!0}).directive("uibPager",["uibPagerConfig",function(a){return{scope:{totalItems:"=",previousText:"@",nextText:"@",ngDisabled:"="},require:["uibPager","?ngModel"],restrict:"A",controller:"UibPagerController",controllerAs:"pager",templateUrl:function(a,b){return b.templateUrl||"uib/template/pager/pager.html"},link:function(b,c,d,e){c.addClass("pager");var f=e[0],g=e[1];g&&f.init(g,a)}}}]),angular.module("ui.bootstrap.pagination",["ui.bootstrap.paging","ui.bootstrap.tabindex"]).controller("UibPaginationController",["$scope","$attrs","$parse","uibPaging","uibPaginationConfig",function(a,b,c,d,e){function f(a,b,c){return{number:a,text:b,active:c}}function g(a,b){var c=[],d=1,e=b,g=angular.isDefined(i)&&b>i;g&&(j?(d=Math.max(a-Math.floor(i/2),1),e=d+i-1,e>b&&(e=b,d=e-i+1)):(d=(Math.ceil(a/i)-1)*i+1,e=Math.min(d+i-1,b)));for(var h=d;e>=h;h++){var n=f(h,m(h),h===a);c.push(n)}if(g&&i>0&&(!j||k||l)){if(d>1){if(!l||d>3){var o=f(d-1,"...",!1);c.unshift(o)}if(l){if(3===d){var p=f(2,"2",!1);c.unshift(p)}var q=f(1,"1",!1);c.unshift(q)}}if(b>e){if(!l||b-2>e){var r=f(e+1,"...",!1);c.push(r)}if(l){if(e===b-2){var s=f(b-1,b-1,!1);c.push(s)}var t=f(b,b,!1);c.push(t)}}}return c}var h=this,i=angular.isDefined(b.maxSize)?a.$parent.$eval(b.maxSize):e.maxSize,j=angular.isDefined(b.rotate)?a.$parent.$eval(b.rotate):e.rotate,k=angular.isDefined(b.forceEllipses)?a.$parent.$eval(b.forceEllipses):e.forceEllipses,l=angular.isDefined(b.boundaryLinkNumbers)?a.$parent.$eval(b.boundaryLinkNumbers):e.boundaryLinkNumbers,m=angular.isDefined(b.pageLabel)?function(c){return a.$parent.$eval(b.pageLabel,{$page:c})}:angular.identity;a.boundaryLinks=angular.isDefined(b.boundaryLinks)?a.$parent.$eval(b.boundaryLinks):e.boundaryLinks,a.directionLinks=angular.isDefined(b.directionLinks)?a.$parent.$eval(b.directionLinks):e.directionLinks,b.$set("role","menu"),d.create(this,a,b),b.maxSize&&h._watchers.push(a.$parent.$watch(c(b.maxSize),function(a){i=parseInt(a,10),h.render()}));var n=this.render;this.render=function(){n(),a.page>0&&a.page<=a.totalPages&&(a.pages=g(a.page,a.totalPages))}}]).constant("uibPaginationConfig",{itemsPerPage:10,boundaryLinks:!1,boundaryLinkNumbers:!1,directionLinks:!0,firstText:"First",previousText:"Previous",nextText:"Next",lastText:"Last",rotate:!0,forceEllipses:!1}).directive("uibPagination",["$parse","uibPaginationConfig",function(a,b){return{scope:{totalItems:"=",firstText:"@",previousText:"@",nextText:"@",lastText:"@",ngDisabled:"="},require:["uibPagination","?ngModel"],restrict:"A",controller:"UibPaginationController",controllerAs:"pagination",templateUrl:function(a,b){return b.templateUrl||"uib/template/pagination/pagination.html"},link:function(a,c,d,e){c.addClass("pagination");var f=e[0],g=e[1];g&&f.init(g,b)}}}]),angular.module("ui.bootstrap.tooltip",["ui.bootstrap.position","ui.bootstrap.stackedMap"]).provider("$uibTooltip",function(){function a(a){var b=/[A-Z]/g,c="-";return a.replace(b,function(a,b){return(b?c:"")+a.toLowerCase()})}var b={placement:"top",placementClassPrefix:"",animation:!0,popupDelay:0,popupCloseDelay:0,useContentExp:!1},c={mouseenter:"mouseleave",click:"click",outsideClick:"outsideClick",focus:"blur",none:""},d={};this.options=function(a){angular.extend(d,a)},this.setTriggers=function(a){angular.extend(c,a)},this.$get=["$window","$compile","$timeout","$document","$uibPosition","$interpolate","$rootScope","$parse","$$stackedMap",function(e,f,g,h,i,j,k,l,m){function n(a){if(27===a.which){var b=o.top();b&&(b.value.close(),b=null)}}var o=m.createNew();return h.on("keyup",n),k.$on("$destroy",function(){h.off("keyup",n)}),function(e,k,m,n){function p(a){var b=(a||n.trigger||m).split(" "),d=b.map(function(a){return c[a]||a});return{show:b,hide:d}}n=angular.extend({},b,d,n);var q=a(e),r=j.startSymbol(),s=j.endSymbol(),t="<div "+q+'-popup uib-title="'+r+"title"+s+'" '+(n.useContentExp?'content-exp="contentExp()" ':'content="'+r+"content"+s+'" ')+'origin-scope="origScope" class="uib-position-measure '+k+'" tooltip-animation-class="fade"uib-tooltip-classes ng-class="{ in: isOpen }" ></div>';return{compile:function(a,b){var c=f(t);return function(a,b,d,f){function j(){P.isOpen?q():m()}function m(){O&&!a.$eval(d[k+"Enable"])||(u(),x(),P.popupDelay?H||(H=g(r,P.popupDelay,!1)):r())}function q(){s(),P.popupCloseDelay?I||(I=g(t,P.popupCloseDelay,!1)):t()}function r(){return s(),u(),P.content?(v(),void P.$evalAsync(function(){P.isOpen=!0,y(!0),U()})):angular.noop}function s(){H&&(g.cancel(H),H=null),J&&(g.cancel(J),J=null)}function t(){P&&P.$evalAsync(function(){P&&(P.isOpen=!1,y(!1),P.animation?G||(G=g(w,150,!1)):w())})}function u(){I&&(g.cancel(I),I=null),G&&(g.cancel(G),G=null)}function v(){E||(F=P.$new(),E=c(F,function(a){M?h.find("body").append(a):b.after(a)}),o.add(P,{close:t}),z())}function w(){s(),u(),A(),E&&(E.remove(),E=null,K&&g.cancel(K)),o.remove(P),F&&(F.$destroy(),F=null)}function x(){P.title=d[k+"Title"],S?P.content=S(a):P.content=d[e],P.popupClass=d[k+"Class"],P.placement=angular.isDefined(d[k+"Placement"])?d[k+"Placement"]:n.placement;var b=i.parsePlacement(P.placement);L=b[1]?b[0]+"-"+b[1]:b[0];var c=parseInt(d[k+"PopupDelay"],10),f=parseInt(d[k+"PopupCloseDelay"],10);P.popupDelay=isNaN(c)?n.popupDelay:c,P.popupCloseDelay=isNaN(f)?n.popupCloseDelay:f}function y(b){R&&angular.isFunction(R.assign)&&R.assign(a,b)}function z(){T.length=0,S?(T.push(a.$watch(S,function(a){P.content=a,!a&&P.isOpen&&t()})),T.push(F.$watch(function(){Q||(Q=!0,F.$$postDigest(function(){Q=!1,P&&P.isOpen&&U()}))}))):T.push(d.$observe(e,function(a){P.content=a,!a&&P.isOpen?t():U()})),T.push(d.$observe(k+"Title",function(a){P.title=a,P.isOpen&&U()})),T.push(d.$observe(k+"Placement",function(a){P.placement=a?a:n.placement,P.isOpen&&U()}))}function A(){T.length&&(angular.forEach(T,function(a){a()}),T.length=0)}function B(a){P&&P.isOpen&&E&&(b[0].contains(a.target)||E[0].contains(a.target)||q())}function C(a){27===a.which&&q()}function D(){var c=[],e=[],f=a.$eval(d[k+"Trigger"]);V(),angular.isObject(f)?(Object.keys(f).forEach(function(a){c.push(a),e.push(f[a])}),N={show:c,hide:e}):N=p(f),"none"!==N.show&&N.show.forEach(function(a,c){"outsideClick"===a?(b.on("click",j),h.on("click",B)):a===N.hide[c]?b.on(a,j):a&&(b.on(a,m),b.on(N.hide[c],q)),b.on("keypress",C)})}var E,F,G,H,I,J,K,L,M=angular.isDefined(n.appendToBody)?n.appendToBody:!1,N=p(void 0),O=angular.isDefined(d[k+"Enable"]),P=a.$new(!0),Q=!1,R=angular.isDefined(d[k+"IsOpen"])?l(d[k+"IsOpen"]):!1,S=n.useContentExp?l(d[e]):!1,T=[],U=function(){E&&E.html()&&(J||(J=g(function(){var a=i.positionElements(b,E,P.placement,M),c=angular.isDefined(E.offsetHeight)?E.offsetHeight:E.prop("offsetHeight"),d=M?i.offset(b):i.position(b);E.css({top:a.top+"px",left:a.left+"px"});var e=a.placement.split("-");E.hasClass(e[0])||(E.removeClass(L.split("-")[0]),E.addClass(e[0])),E.hasClass(n.placementClassPrefix+a.placement)||(E.removeClass(n.placementClassPrefix+L),E.addClass(n.placementClassPrefix+a.placement)),K=g(function(){var a=angular.isDefined(E.offsetHeight)?E.offsetHeight:E.prop("offsetHeight"),b=i.adjustTop(e,d,c,a);b&&E.css(b),K=null},0,!1),E.hasClass("uib-position-measure")?(i.positionArrow(E,a.placement),E.removeClass("uib-position-measure")):L!==a.placement&&i.positionArrow(E,a.placement),L=a.placement,J=null},0,!1)))};P.origScope=a,P.isOpen=!1,P.contentExp=function(){return P.content},d.$observe("disabled",function(a){a&&s(),a&&P.isOpen&&t()}),R&&a.$watch(R,function(a){P&&!a===P.isOpen&&j()});var V=function(){N.show.forEach(function(a){"outsideClick"===a?b.off("click",j):(b.off(a,m),b.off(a,j)),b.off("keypress",C)}),N.hide.forEach(function(a){"outsideClick"===a?h.off("click",B):b.off(a,q)})};D();var W=a.$eval(d[k+"Animation"]);P.animation=angular.isDefined(W)?!!W:n.animation;var X,Y=k+"AppendToBody";X=Y in d&&void 0===d[Y]?!0:a.$eval(d[Y]),M=angular.isDefined(X)?X:M,a.$on("$destroy",function(){V(),w(),P=null})}}}}}]}).directive("uibTooltipTemplateTransclude",["$animate","$sce","$compile","$templateRequest",function(a,b,c,d){return{link:function(e,f,g){var h,i,j,k=e.$eval(g.tooltipTemplateTranscludeScope),l=0,m=function(){i&&(i.remove(),i=null),h&&(h.$destroy(),h=null),j&&(a.leave(j).then(function(){i=null}),i=j,j=null)};e.$watch(b.parseAsResourceUrl(g.uibTooltipTemplateTransclude),function(b){var g=++l;b?(d(b,!0).then(function(d){if(g===l){var e=k.$new(),i=d,n=c(i)(e,function(b){m(),a.enter(b,f)});h=e,j=n,h.$emit("$includeContentLoaded",b)}},function(){g===l&&(m(),e.$emit("$includeContentError",b))}),e.$emit("$includeContentRequested",b)):m()}),e.$on("$destroy",m)}}}]).directive("uibTooltipClasses",["$uibPosition",function(a){return{restrict:"A",link:function(b,c,d){if(b.placement){var e=a.parsePlacement(b.placement);c.addClass(e[0])}b.popupClass&&c.addClass(b.popupClass),b.animation&&c.addClass(d.tooltipAnimationClass)}}}]).directive("uibTooltipPopup",function(){return{restrict:"A",scope:{content:"@"},templateUrl:"uib/template/tooltip/tooltip-popup.html"}}).directive("uibTooltip",["$uibTooltip",function(a){return a("uibTooltip","tooltip","mouseenter")}]).directive("uibTooltipTemplatePopup",function(){return{restrict:"A",scope:{contentExp:"&",originScope:"&"},templateUrl:"uib/template/tooltip/tooltip-template-popup.html"}}).directive("uibTooltipTemplate",["$uibTooltip",function(a){return a("uibTooltipTemplate","tooltip","mouseenter",{useContentExp:!0})}]).directive("uibTooltipHtmlPopup",function(){return{restrict:"A",scope:{contentExp:"&"},templateUrl:"uib/template/tooltip/tooltip-html-popup.html"}}).directive("uibTooltipHtml",["$uibTooltip",function(a){return a("uibTooltipHtml","tooltip","mouseenter",{useContentExp:!0})}]),angular.module("ui.bootstrap.popover",["ui.bootstrap.tooltip"]).directive("uibPopoverTemplatePopup",function(){return{restrict:"A",scope:{uibTitle:"@",contentExp:"&",originScope:"&"},templateUrl:"uib/template/popover/popover-template.html"}}).directive("uibPopoverTemplate",["$uibTooltip",function(a){return a("uibPopoverTemplate","popover","click",{useContentExp:!0})}]).directive("uibPopoverHtmlPopup",function(){return{restrict:"A",scope:{contentExp:"&",uibTitle:"@"},templateUrl:"uib/template/popover/popover-html.html"}}).directive("uibPopoverHtml",["$uibTooltip",function(a){return a("uibPopoverHtml","popover","click",{useContentExp:!0})}]).directive("uibPopoverPopup",function(){return{restrict:"A",scope:{uibTitle:"@",content:"@"},templateUrl:"uib/template/popover/popover.html"}}).directive("uibPopover",["$uibTooltip",function(a){return a("uibPopover","popover","click")}]),angular.module("ui.bootstrap.progressbar",[]).constant("uibProgressConfig",{animate:!0,max:100}).controller("UibProgressController",["$scope","$attrs","uibProgressConfig",function(a,b,c){function d(){return angular.isDefined(a.maxParam)?a.maxParam:c.max}var e=this,f=angular.isDefined(b.animate)?a.$parent.$eval(b.animate):c.animate;this.bars=[],a.max=d(),this.addBar=function(a,b,c){f||b.css({transition:"none"}),this.bars.push(a),a.max=d(),a.title=c&&angular.isDefined(c.title)?c.title:"progressbar",a.$watch("value",function(b){a.recalculatePercentage()}),a.recalculatePercentage=function(){var b=e.bars.reduce(function(a,b){return b.percent=+(100*b.value/b.max).toFixed(2),a+b.percent},0);b>100&&(a.percent-=b-100)},a.$on("$destroy",function(){b=null,e.removeBar(a)})},this.removeBar=function(a){this.bars.splice(this.bars.indexOf(a),1),this.bars.forEach(function(a){a.recalculatePercentage()})},a.$watch("maxParam",function(a){e.bars.forEach(function(a){a.max=d(),a.recalculatePercentage()})})}]).directive("uibProgress",function(){return{replace:!0,transclude:!0,controller:"UibProgressController",require:"uibProgress",scope:{maxParam:"=?max"},templateUrl:"uib/template/progressbar/progress.html"}}).directive("uibBar",function(){return{replace:!0,transclude:!0,require:"^uibProgress",scope:{value:"=",type:"@"},templateUrl:"uib/template/progressbar/bar.html",link:function(a,b,c,d){d.addBar(a,b,c)}}}).directive("uibProgressbar",function(){return{replace:!0,transclude:!0,controller:"UibProgressController",scope:{value:"=",maxParam:"=?max",type:"@"},templateUrl:"uib/template/progressbar/progressbar.html",link:function(a,b,c,d){d.addBar(a,angular.element(b.children()[0]),{title:c.title})}}}),angular.module("ui.bootstrap.rating",[]).constant("uibRatingConfig",{max:5,stateOn:null,stateOff:null,enableReset:!0,titles:["one","two","three","four","five"]}).controller("UibRatingController",["$scope","$attrs","uibRatingConfig",function(a,b,c){var d={$setViewValue:angular.noop},e=this;this.init=function(e){d=e,d.$render=this.render,d.$formatters.push(function(a){return angular.isNumber(a)&&a<<0!==a&&(a=Math.round(a)),a}),this.stateOn=angular.isDefined(b.stateOn)?a.$parent.$eval(b.stateOn):c.stateOn,this.stateOff=angular.isDefined(b.stateOff)?a.$parent.$eval(b.stateOff):c.stateOff,this.enableReset=angular.isDefined(b.enableReset)?a.$parent.$eval(b.enableReset):c.enableReset;var f=angular.isDefined(b.titles)?a.$parent.$eval(b.titles):c.titles;this.titles=angular.isArray(f)&&f.length>0?f:c.titles;var g=angular.isDefined(b.ratingStates)?a.$parent.$eval(b.ratingStates):new Array(angular.isDefined(b.max)?a.$parent.$eval(b.max):c.max);a.range=this.buildTemplateObjects(g)},this.buildTemplateObjects=function(a){for(var b=0,c=a.length;c>b;b++)a[b]=angular.extend({index:b},{stateOn:this.stateOn,stateOff:this.stateOff,title:this.getTitle(b)},a[b]);return a},this.getTitle=function(a){return a>=this.titles.length?a+1:this.titles[a]},a.rate=function(b){if(!a.readonly&&b>=0&&b<=a.range.length){var c=e.enableReset&&d.$viewValue===b?0:b;d.$setViewValue(c),d.$render()}},a.enter=function(b){a.readonly||(a.value=b),a.onHover({value:b})},a.reset=function(){a.value=d.$viewValue,a.onLeave()},a.onKeydown=function(b){/(37|38|39|40)/.test(b.which)&&(b.preventDefault(),b.stopPropagation(),a.rate(a.value+(38===b.which||39===b.which?1:-1)))},this.render=function(){a.value=d.$viewValue,a.title=e.getTitle(a.value-1)}}]).directive("uibRating",function(){return{require:["uibRating","ngModel"],restrict:"A",scope:{readonly:"=?readOnly",onHover:"&",onLeave:"&"},controller:"UibRatingController",templateUrl:"uib/template/rating/rating.html",link:function(a,b,c,d){var e=d[0],f=d[1];e.init(f)}}}),angular.module("ui.bootstrap.tabs",[]).controller("UibTabsetController",["$scope",function(a){function b(a){for(var b=0;b<d.tabs.length;b++)if(d.tabs[b].index===a)return b}var c,d=this;d.tabs=[],d.select=function(a,f){if(!e){var g=b(c),h=d.tabs[g];if(h){if(h.tab.onDeselect({$event:f,$selectedIndex:a}),f&&f.isDefaultPrevented())return;h.tab.active=!1}var i=d.tabs[a];i?(i.tab.onSelect({$event:f}),i.tab.active=!0,d.active=i.index,c=i.index):!i&&angular.isDefined(c)&&(d.active=null,c=null)}},d.addTab=function(a){if(d.tabs.push({tab:a,index:a.index}),d.tabs.sort(function(a,b){return a.index>b.index?1:a.index<b.index?-1:0}),a.index===d.active||!angular.isDefined(d.active)&&1===d.tabs.length){var c=b(a.index);d.select(c)}},d.removeTab=function(a){for(var b,c=0;c<d.tabs.length;c++)if(d.tabs[c].tab===a){b=c;break}if(d.tabs[b].index===d.active){var e=b===d.tabs.length-1?b-1:b+1%d.tabs.length;d.select(e)}d.tabs.splice(b,1)},a.$watch("tabset.active",function(a){angular.isDefined(a)&&a!==c&&d.select(b(a))});var e;a.$on("$destroy",function(){e=!0})}]).directive("uibTabset",function(){return{transclude:!0,replace:!0,scope:{},bindToController:{active:"=?",type:"@"},controller:"UibTabsetController",controllerAs:"tabset",templateUrl:function(a,b){return b.templateUrl||"uib/template/tabs/tabset.html"},link:function(a,b,c){a.vertical=angular.isDefined(c.vertical)?a.$parent.$eval(c.vertical):!1,a.justified=angular.isDefined(c.justified)?a.$parent.$eval(c.justified):!1}}}).directive("uibTab",["$parse",function(a){return{require:"^uibTabset",replace:!0,templateUrl:function(a,b){return b.templateUrl||"uib/template/tabs/tab.html"},transclude:!0,scope:{heading:"@",index:"=?",classes:"@?",onSelect:"&select",onDeselect:"&deselect"},controller:function(){},controllerAs:"tab",link:function(b,c,d,e,f){b.disabled=!1,d.disable&&b.$parent.$watch(a(d.disable),function(a){b.disabled=!!a}),angular.isUndefined(d.index)&&(e.tabs&&e.tabs.length?b.index=Math.max.apply(null,e.tabs.map(function(a){return a.index}))+1:b.index=0),angular.isUndefined(d.classes)&&(b.classes=""),b.select=function(a){if(!b.disabled){for(var c,d=0;d<e.tabs.length;d++)if(e.tabs[d].tab===b){c=d;break}e.select(c,a)}},e.addTab(b),b.$on("$destroy",function(){e.removeTab(b)}),b.$transcludeFn=f}}}]).directive("uibTabHeadingTransclude",function(){return{restrict:"A",require:"^uibTab",link:function(a,b){a.$watch("headingElement",function(a){a&&(b.html(""),b.append(a))})}}}).directive("uibTabContentTransclude",function(){function a(a){return a.tagName&&(a.hasAttribute("uib-tab-heading")||a.hasAttribute("data-uib-tab-heading")||a.hasAttribute("x-uib-tab-heading")||"uib-tab-heading"===a.tagName.toLowerCase()||"data-uib-tab-heading"===a.tagName.toLowerCase()||"x-uib-tab-heading"===a.tagName.toLowerCase()||"uib:tab-heading"===a.tagName.toLowerCase())}return{restrict:"A",require:"^uibTabset",link:function(b,c,d){var e=b.$eval(d.uibTabContentTransclude).tab;e.$transcludeFn(e.$parent,function(b){angular.forEach(b,function(b){a(b)?e.headingElement=b:c.append(b)})})}}}),angular.module("ui.bootstrap.timepicker",[]).constant("uibTimepickerConfig",{hourStep:1,minuteStep:1,secondStep:1,showMeridian:!0,showSeconds:!1,meridians:null,readonlyInput:!1,mousewheel:!0,arrowkeys:!0,showSpinners:!0,templateUrl:"uib/template/timepicker/timepicker.html"}).controller("UibTimepickerController",["$scope","$element","$attrs","$parse","$log","$locale","uibTimepickerConfig",function(a,b,c,d,e,f,g){function h(){var b=+a.hours,c=a.showMeridian?b>0&&13>b:b>=0&&24>b;return c&&""!==a.hours?(a.showMeridian&&(12===b&&(b=0),a.meridian===y[1]&&(b+=12)),b):void 0}function i(){var b=+a.minutes,c=b>=0&&60>b;return c&&""!==a.minutes?b:void 0}function j(){var b=+a.seconds;return b>=0&&60>b?b:void 0}function k(a,b){return null===a?"":angular.isDefined(a)&&a.toString().length<2&&!b?"0"+a:a.toString()}function l(a){m(),x.$setViewValue(new Date(v)),n(a)}function m(){s&&s.$setValidity("hours",!0),t&&t.$setValidity("minutes",!0),u&&u.$setValidity("seconds",!0),x.$setValidity("time",!0),a.invalidHours=!1,a.invalidMinutes=!1,a.invalidSeconds=!1}function n(b){if(x.$modelValue){var c=v.getHours(),d=v.getMinutes(),e=v.getSeconds();a.showMeridian&&(c=0===c||12===c?12:c%12),a.hours="h"===b?c:k(c,!z),"m"!==b&&(a.minutes=k(d)),a.meridian=v.getHours()<12?y[0]:y[1],"s"!==b&&(a.seconds=k(e)),a.meridian=v.getHours()<12?y[0]:y[1]}else a.hours=null,a.minutes=null,a.seconds=null,a.meridian=y[0]}function o(a){v=q(v,a),l()}function p(a,b){return q(a,60*b)}function q(a,b){var c=new Date(a.getTime()+1e3*b),d=new Date(a);return d.setHours(c.getHours(),c.getMinutes(),c.getSeconds()),d}function r(){return(null===a.hours||""===a.hours)&&(null===a.minutes||""===a.minutes)&&(!a.showSeconds||a.showSeconds&&(null===a.seconds||""===a.seconds))}var s,t,u,v=new Date,w=[],x={$setViewValue:angular.noop},y=angular.isDefined(c.meridians)?a.$parent.$eval(c.meridians):g.meridians||f.DATETIME_FORMATS.AMPMS,z=angular.isDefined(c.padHours)?a.$parent.$eval(c.padHours):!0;a.tabindex=angular.isDefined(c.tabindex)?c.tabindex:0,b.removeAttr("tabindex"),this.init=function(b,d){x=b,x.$render=this.render,x.$formatters.unshift(function(a){return a?new Date(a):null});var e=d.eq(0),f=d.eq(1),h=d.eq(2);s=e.controller("ngModel"),t=f.controller("ngModel"),u=h.controller("ngModel");var i=angular.isDefined(c.mousewheel)?a.$parent.$eval(c.mousewheel):g.mousewheel;i&&this.setupMousewheelEvents(e,f,h);var j=angular.isDefined(c.arrowkeys)?a.$parent.$eval(c.arrowkeys):g.arrowkeys;j&&this.setupArrowkeyEvents(e,f,h),a.readonlyInput=angular.isDefined(c.readonlyInput)?a.$parent.$eval(c.readonlyInput):g.readonlyInput,this.setupInputEvents(e,f,h)};var A=g.hourStep;c.hourStep&&w.push(a.$parent.$watch(d(c.hourStep),function(a){A=+a}));var B=g.minuteStep;c.minuteStep&&w.push(a.$parent.$watch(d(c.minuteStep),function(a){B=+a}));var C;w.push(a.$parent.$watch(d(c.min),function(a){var b=new Date(a);C=isNaN(b)?void 0:b}));var D;w.push(a.$parent.$watch(d(c.max),function(a){var b=new Date(a);D=isNaN(b)?void 0:b}));var E=!1;c.ngDisabled&&w.push(a.$parent.$watch(d(c.ngDisabled),function(a){E=a})),a.noIncrementHours=function(){var a=p(v,60*A);return E||a>D||v>a&&C>a},a.noDecrementHours=function(){var a=p(v,60*-A);return E||C>a||a>v&&a>D},a.noIncrementMinutes=function(){var a=p(v,B);return E||a>D||v>a&&C>a},a.noDecrementMinutes=function(){var a=p(v,-B);return E||C>a||a>v&&a>D},a.noIncrementSeconds=function(){var a=q(v,F);return E||a>D||v>a&&C>a},a.noDecrementSeconds=function(){var a=q(v,-F);return E||C>a||a>v&&a>D},a.noToggleMeridian=function(){return v.getHours()<12?E||p(v,720)>D:E||p(v,-720)<C};var F=g.secondStep;c.secondStep&&w.push(a.$parent.$watch(d(c.secondStep),function(a){F=+a})),a.showSeconds=g.showSeconds,c.showSeconds&&w.push(a.$parent.$watch(d(c.showSeconds),function(b){a.showSeconds=!!b})),a.showMeridian=g.showMeridian,c.showMeridian&&w.push(a.$parent.$watch(d(c.showMeridian),function(b){if(a.showMeridian=!!b,x.$error.time){var c=h(),d=i();angular.isDefined(c)&&angular.isDefined(d)&&(v.setHours(c),l())}else n()})),this.setupMousewheelEvents=function(b,c,d){var e=function(a){a.originalEvent&&(a=a.originalEvent);var b=a.wheelDelta?a.wheelDelta:-a.deltaY;return a.detail||b>0};b.on("mousewheel wheel",function(b){E||a.$apply(e(b)?a.incrementHours():a.decrementHours()),b.preventDefault()}),c.on("mousewheel wheel",function(b){E||a.$apply(e(b)?a.incrementMinutes():a.decrementMinutes()),b.preventDefault()}),d.on("mousewheel wheel",function(b){E||a.$apply(e(b)?a.incrementSeconds():a.decrementSeconds()),b.preventDefault()})},this.setupArrowkeyEvents=function(b,c,d){b.on("keydown",function(b){E||(38===b.which?(b.preventDefault(),a.incrementHours(),a.$apply()):40===b.which&&(b.preventDefault(),a.decrementHours(),a.$apply()))}),c.on("keydown",function(b){E||(38===b.which?(b.preventDefault(),a.incrementMinutes(),a.$apply()):40===b.which&&(b.preventDefault(),a.decrementMinutes(),a.$apply()))}),d.on("keydown",function(b){E||(38===b.which?(b.preventDefault(),a.incrementSeconds(),a.$apply()):40===b.which&&(b.preventDefault(),a.decrementSeconds(),a.$apply()))})},this.setupInputEvents=function(b,c,d){if(a.readonlyInput)return a.updateHours=angular.noop,a.updateMinutes=angular.noop,void(a.updateSeconds=angular.noop);var e=function(b,c,d){x.$setViewValue(null),x.$setValidity("time",!1),angular.isDefined(b)&&(a.invalidHours=b,s&&s.$setValidity("hours",!1)),angular.isDefined(c)&&(a.invalidMinutes=c,t&&t.$setValidity("minutes",!1)),angular.isDefined(d)&&(a.invalidSeconds=d,u&&u.$setValidity("seconds",!1))};a.updateHours=function(){var a=h(),b=i();x.$setDirty(),angular.isDefined(a)&&angular.isDefined(b)?(v.setHours(a),v.setMinutes(b),C>v||v>D?e(!0):l("h")):e(!0)},b.on("blur",function(b){x.$setTouched(),r()?m():null===a.hours||""===a.hours?e(!0):!a.invalidHours&&a.hours<10&&a.$apply(function(){a.hours=k(a.hours,!z)})}),a.updateMinutes=function(){var a=i(),b=h();x.$setDirty(),angular.isDefined(a)&&angular.isDefined(b)?(v.setHours(b),v.setMinutes(a),C>v||v>D?e(void 0,!0):l("m")):e(void 0,!0)},c.on("blur",function(b){x.$setTouched(),r()?m():null===a.minutes?e(void 0,!0):!a.invalidMinutes&&a.minutes<10&&a.$apply(function(){a.minutes=k(a.minutes)})}),a.updateSeconds=function(){var a=j();x.$setDirty(),angular.isDefined(a)?(v.setSeconds(a),l("s")):e(void 0,void 0,!0)},d.on("blur",function(b){r()?m():!a.invalidSeconds&&a.seconds<10&&a.$apply(function(){a.seconds=k(a.seconds)})})},this.render=function(){var b=x.$viewValue;isNaN(b)?(x.$setValidity("time",!1),e.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.')):(b&&(v=b),C>v||v>D?(x.$setValidity("time",!1),a.invalidHours=!0,a.invalidMinutes=!0):m(),n())},a.showSpinners=angular.isDefined(c.showSpinners)?a.$parent.$eval(c.showSpinners):g.showSpinners,a.incrementHours=function(){a.noIncrementHours()||o(60*A*60)},a.decrementHours=function(){a.noDecrementHours()||o(60*-A*60)},a.incrementMinutes=function(){a.noIncrementMinutes()||o(60*B)},a.decrementMinutes=function(){a.noDecrementMinutes()||o(60*-B)},a.incrementSeconds=function(){a.noIncrementSeconds()||o(F)},a.decrementSeconds=function(){a.noDecrementSeconds()||o(-F)},a.toggleMeridian=function(){var b=i(),c=h();a.noToggleMeridian()||(angular.isDefined(b)&&angular.isDefined(c)?o(720*(v.getHours()<12?60:-60)):a.meridian=a.meridian===y[0]?y[1]:y[0])},a.blur=function(){x.$setTouched()},a.$on("$destroy",function(){for(;w.length;)w.shift()()})}]).directive("uibTimepicker",["uibTimepickerConfig",function(a){return{require:["uibTimepicker","?^ngModel"],restrict:"A",controller:"UibTimepickerController",controllerAs:"timepicker",scope:{},templateUrl:function(b,c){return c.templateUrl||a.templateUrl},link:function(a,b,c,d){var e=d[0],f=d[1];f&&e.init(f,b.find("input"))}}}]),angular.module("ui.bootstrap.typeahead",["ui.bootstrap.debounce","ui.bootstrap.position"]).factory("uibTypeaheadParser",["$parse",function(a){var b=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+([\s\S]+?)$/;return{parse:function(c){var d=c.match(b);if(!d)throw new Error('Expected typeahead specification in form of "_modelValue_ (as _label_)? for _item_ in _collection_" but got "'+c+'".');return{itemName:d[3],source:a(d[4]),viewMapper:a(d[2]||d[1]),modelMapper:a(d[1])}}}}]).controller("UibTypeaheadController",["$scope","$element","$attrs","$compile","$parse","$q","$timeout","$document","$window","$rootScope","$$debounce","$uibPosition","uibTypeaheadParser",function(a,b,c,d,e,f,g,h,i,j,k,l,m){function n(){P.moveInProgress||(P.moveInProgress=!0,P.$digest()),$()}function o(){P.position=F?l.offset(b):l.position(b),P.position.top+=b.prop("offsetHeight")}function p(a){var b;return angular.version.minor<6?(b=a.$options||{},b.getOption=function(a){return b[a]}):b=a.$options,b}var q,r,s=[9,13,27,38,40],t=200,u=a.$eval(c.typeaheadMinLength);u||0===u||(u=1),a.$watch(c.typeaheadMinLength,function(a){u=a||0===a?a:1});var v=a.$eval(c.typeaheadWaitMs)||0,w=a.$eval(c.typeaheadEditable)!==!1;a.$watch(c.typeaheadEditable,function(a){w=a!==!1});var x,y,z=e(c.typeaheadLoading).assign||angular.noop,A=c.typeaheadShouldSelect?e(c.typeaheadShouldSelect):function(a,b){var c=b.$event;return 13===c.which||9===c.which},B=e(c.typeaheadOnSelect),C=angular.isDefined(c.typeaheadSelectOnBlur)?a.$eval(c.typeaheadSelectOnBlur):!1,D=e(c.typeaheadNoResults).assign||angular.noop,E=c.typeaheadInputFormatter?e(c.typeaheadInputFormatter):void 0,F=c.typeaheadAppendToBody?a.$eval(c.typeaheadAppendToBody):!1,G=c.typeaheadAppendTo?a.$eval(c.typeaheadAppendTo):null,H=a.$eval(c.typeaheadFocusFirst)!==!1,I=c.typeaheadSelectOnExact?a.$eval(c.typeaheadSelectOnExact):!1,J=e(c.typeaheadIsOpen).assign||angular.noop,K=a.$eval(c.typeaheadShowHint)||!1,L=e(c.ngModel),M=e(c.ngModel+"($$$p)"),N=function(b,c){return angular.isFunction(L(a))&&r.getOption("getterSetter")?M(b,{$$$p:c}):L.assign(b,c)},O=m.parse(c.uibTypeahead),P=a.$new(),Q=a.$on("$destroy",function(){P.$destroy()});P.$on("$destroy",Q);var R="typeahead-"+P.$id+"-"+Math.floor(1e4*Math.random());b.attr({"aria-autocomplete":"list","aria-expanded":!1,"aria-owns":R});var S,T;K&&(S=angular.element("<div></div>"),S.css("position","relative"),b.after(S),T=b.clone(),T.attr("placeholder",""),T.attr("tabindex","-1"),T.val(""),T.css({position:"absolute",top:"0px",left:"0px","border-color":"transparent","box-shadow":"none",opacity:1,background:"none 0% 0% / auto repeat scroll padding-box border-box rgb(255, 255, 255)",color:"#999"}),b.css({position:"relative","vertical-align":"top","background-color":"transparent"}),T.attr("id")&&T.removeAttr("id"),S.append(T),T.after(b));var U=angular.element("<div uib-typeahead-popup></div>");U.attr({id:R,matches:"matches",active:"activeIdx",select:"select(activeIdx, evt)","move-in-progress":"moveInProgress",query:"query",position:"position","assign-is-open":"assignIsOpen(isOpen)",debounce:"debounceUpdate"}),angular.isDefined(c.typeaheadTemplateUrl)&&U.attr("template-url",c.typeaheadTemplateUrl),angular.isDefined(c.typeaheadPopupTemplateUrl)&&U.attr("popup-template-url",c.typeaheadPopupTemplateUrl);var V=function(){K&&T.val("")},W=function(){P.matches=[],P.activeIdx=-1,b.attr("aria-expanded",!1),V()},X=function(a){return R+"-option-"+a};P.$watch("activeIdx",function(a){0>a?b.removeAttr("aria-activedescendant"):b.attr("aria-activedescendant",X(a))});var Y=function(a,b){return P.matches.length>b&&a?a.toUpperCase()===P.matches[b].label.toUpperCase():!1},Z=function(c,d){var e={$viewValue:c};z(a,!0),D(a,!1),f.when(O.source(a,e)).then(function(f){var g=c===q.$viewValue;if(g&&x)if(f&&f.length>0){P.activeIdx=H?0:-1,D(a,!1),P.matches.length=0;for(var h=0;h<f.length;h++)e[O.itemName]=f[h],P.matches.push({id:X(h),label:O.viewMapper(P,e),model:f[h]});if(P.query=c,o(),b.attr("aria-expanded",!0),I&&1===P.matches.length&&Y(c,0)&&(angular.isNumber(P.debounceUpdate)||angular.isObject(P.debounceUpdate)?k(function(){P.select(0,d)},angular.isNumber(P.debounceUpdate)?P.debounceUpdate:P.debounceUpdate["default"]):P.select(0,d)),K){var i=P.matches[0].label;angular.isString(c)&&c.length>0&&i.slice(0,c.length).toUpperCase()===c.toUpperCase()?T.val(c+i.slice(c.length)):T.val("")}}else W(),D(a,!0);g&&z(a,!1)},function(){W(),z(a,!1),D(a,!0)})};F&&(angular.element(i).on("resize",n),h.find("body").on("scroll",n));var $=k(function(){P.matches.length&&o(),P.moveInProgress=!1},t);P.moveInProgress=!1,P.query=void 0;var _,aa=function(a){_=g(function(){Z(a)},v)},ba=function(){_&&g.cancel(_)};W(),P.assignIsOpen=function(b){J(a,b)},P.select=function(d,e){var f,h,i={};y=!0,i[O.itemName]=h=P.matches[d].model,f=O.modelMapper(a,i),N(a,f),q.$setValidity("editable",!0),q.$setValidity("parse",!0),B(a,{$item:h,$model:f,$label:O.viewMapper(a,i),$event:e}),W(),P.$eval(c.typeaheadFocusOnSelect)!==!1&&g(function(){b[0].focus()},0,!1)},b.on("keydown",function(b){if(0!==P.matches.length&&-1!==s.indexOf(b.which)){var c=A(a,{$event:b});if(-1===P.activeIdx&&c||9===b.which&&b.shiftKey)return W(),void P.$digest();b.preventDefault();var d;switch(b.which){case 27:b.stopPropagation(),W(),a.$digest();break;case 38:P.activeIdx=(P.activeIdx>0?P.activeIdx:P.matches.length)-1,P.$digest(),d=U[0].querySelectorAll(".uib-typeahead-match")[P.activeIdx],d.parentNode.scrollTop=d.offsetTop;break;case 40:P.activeIdx=(P.activeIdx+1)%P.matches.length,P.$digest(),d=U[0].querySelectorAll(".uib-typeahead-match")[P.activeIdx],
d.parentNode.scrollTop=d.offsetTop;break;default:c&&P.$apply(function(){angular.isNumber(P.debounceUpdate)||angular.isObject(P.debounceUpdate)?k(function(){P.select(P.activeIdx,b)},angular.isNumber(P.debounceUpdate)?P.debounceUpdate:P.debounceUpdate["default"]):P.select(P.activeIdx,b)})}}}),b.on("focus",function(a){x=!0,0!==u||q.$viewValue||g(function(){Z(q.$viewValue,a)},0)}),b.on("blur",function(a){C&&P.matches.length&&-1!==P.activeIdx&&!y&&(y=!0,P.$apply(function(){angular.isObject(P.debounceUpdate)&&angular.isNumber(P.debounceUpdate.blur)?k(function(){P.select(P.activeIdx,a)},P.debounceUpdate.blur):P.select(P.activeIdx,a)})),!w&&q.$error.editable&&(q.$setViewValue(),P.$apply(function(){q.$setValidity("editable",!0),q.$setValidity("parse",!0)}),b.val("")),x=!1,y=!1});var ca=function(c){b[0]!==c.target&&3!==c.which&&0!==P.matches.length&&(W(),j.$$phase||a.$digest())};h.on("click",ca),a.$on("$destroy",function(){h.off("click",ca),(F||G)&&da.remove(),F&&(angular.element(i).off("resize",n),h.find("body").off("scroll",n)),U.remove(),K&&S.remove()});var da=d(U)(P);F?h.find("body").append(da):G?angular.element(G).eq(0).append(da):b.after(da),this.init=function(b){q=b,r=p(q),P.debounceUpdate=e(r.getOption("debounce"))(a),q.$parsers.unshift(function(b){return x=!0,0===u||b&&b.length>=u?v>0?(ba(),aa(b)):Z(b):(z(a,!1),ba(),W()),w?b:b?void q.$setValidity("editable",!1):(q.$setValidity("editable",!0),null)}),q.$formatters.push(function(b){var c,d,e={};return w||q.$setValidity("editable",!0),E?(e.$model=b,E(a,e)):(e[O.itemName]=b,c=O.viewMapper(a,e),e[O.itemName]=void 0,d=O.viewMapper(a,e),c!==d?c:b)})}}]).directive("uibTypeahead",function(){return{controller:"UibTypeaheadController",require:["ngModel","uibTypeahead"],link:function(a,b,c,d){d[1].init(d[0])}}}).directive("uibTypeaheadPopup",["$$debounce",function(a){return{scope:{matches:"=",query:"=",active:"=",position:"&",moveInProgress:"=",select:"&",assignIsOpen:"&",debounce:"&"},replace:!0,templateUrl:function(a,b){return b.popupTemplateUrl||"uib/template/typeahead/typeahead-popup.html"},link:function(b,c,d){b.templateUrl=d.templateUrl,b.isOpen=function(){var a=b.matches.length>0;return b.assignIsOpen({isOpen:a}),a},b.isActive=function(a){return b.active===a},b.selectActive=function(a){b.active=a},b.selectMatch=function(c,d){var e=b.debounce();angular.isNumber(e)||angular.isObject(e)?a(function(){b.select({activeIdx:c,evt:d})},angular.isNumber(e)?e:e["default"]):b.select({activeIdx:c,evt:d})}}}}]).directive("uibTypeaheadMatch",["$templateRequest","$compile","$parse",function(a,b,c){return{scope:{index:"=",match:"=",query:"="},link:function(d,e,f){var g=c(f.templateUrl)(d.$parent)||"uib/template/typeahead/typeahead-match.html";a(g).then(function(a){var c=angular.element(a.trim());e.replaceWith(c),b(c)(d)})}}}]).filter("uibTypeaheadHighlight",["$sce","$injector","$log",function(a,b,c){function d(a){return a.replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}function e(a){return/<.*>/g.test(a)}var f;return f=b.has("$sanitize"),function(b,g){return!f&&e(b)&&c.warn("Unsafe use of typeahead please use ngSanitize"),b=g?(""+b).replace(new RegExp(d(g),"gi"),"<strong>$&</strong>"):b,f||(b=a.trustAsHtml(b)),b}}]),angular.module("uib/template/accordion/accordion-group.html",[]).run(["$templateCache",function(a){a.put("uib/template/accordion/accordion-group.html",'<div role="tab" id="{{::headingId}}" aria-selected="{{isOpen}}" class="panel-heading" ng-keypress="toggleOpen($event)">\n  <h4 class="panel-title">\n    <a role="button" data-toggle="collapse" href aria-expanded="{{isOpen}}" aria-controls="{{::panelId}}" tabindex="0" class="accordion-toggle" ng-click="toggleOpen()" uib-accordion-transclude="heading" ng-disabled="isDisabled" uib-tabindex-toggle><span uib-accordion-header ng-class="{\'text-muted\': isDisabled}">{{heading}}</span></a>\n  </h4>\n</div>\n<div id="{{::panelId}}" aria-labelledby="{{::headingId}}" aria-hidden="{{!isOpen}}" role="tabpanel" class="panel-collapse collapse" uib-collapse="!isOpen">\n  <div class="panel-body" ng-transclude></div>\n</div>\n')}]),angular.module("uib/template/accordion/accordion.html",[]).run(["$templateCache",function(a){a.put("uib/template/accordion/accordion.html",'<div role="tablist" class="panel-group" ng-transclude></div>')}]),angular.module("uib/template/alert/alert.html",[]).run(["$templateCache",function(a){a.put("uib/template/alert/alert.html",'<button ng-show="closeable" type="button" class="close" ng-click="close({$event: $event})">\n  <span aria-hidden="true">&times;</span>\n  <span class="sr-only">Close</span>\n</button>\n<div ng-transclude></div>\n')}]),angular.module("uib/template/carousel/carousel.html",[]).run(["$templateCache",function(a){a.put("uib/template/carousel/carousel.html",'<div class="carousel-inner" ng-transclude></div>\n<a role="button" href class="left carousel-control" ng-click="prev()" ng-class="{ disabled: isPrevDisabled() }" ng-show="slides.length > 1">\n  <span aria-hidden="true" class="glyphicon glyphicon-chevron-left"></span>\n  <span class="sr-only">previous</span>\n</a>\n<a role="button" href class="right carousel-control" ng-click="next()" ng-class="{ disabled: isNextDisabled() }" ng-show="slides.length > 1">\n  <span aria-hidden="true" class="glyphicon glyphicon-chevron-right"></span>\n  <span class="sr-only">next</span>\n</a>\n<ol class="carousel-indicators" ng-show="slides.length > 1">\n  <li ng-repeat="slide in slides | orderBy:indexOfSlide track by $index" ng-class="{ active: isActive(slide) }" ng-click="select(slide)">\n    <span class="sr-only">slide {{ $index + 1 }} of {{ slides.length }}<span ng-if="isActive(slide)">, currently active</span></span>\n  </li>\n</ol>\n')}]),angular.module("uib/template/carousel/slide.html",[]).run(["$templateCache",function(a){a.put("uib/template/carousel/slide.html",'<div class="text-center" ng-transclude></div>\n')}]),angular.module("uib/template/datepicker/datepicker.html",[]).run(["$templateCache",function(a){a.put("uib/template/datepicker/datepicker.html",'<div ng-switch="datepickerMode">\n  <div uib-daypicker ng-switch-when="day" tabindex="0" class="uib-daypicker"></div>\n  <div uib-monthpicker ng-switch-when="month" tabindex="0" class="uib-monthpicker"></div>\n  <div uib-yearpicker ng-switch-when="year" tabindex="0" class="uib-yearpicker"></div>\n</div>\n')}]),angular.module("uib/template/datepicker/day.html",[]).run(["$templateCache",function(a){a.put("uib/template/datepicker/day.html",'<table role="grid" aria-labelledby="{{::uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left uib-left" ng-click="move(-1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-left"></i><span class="sr-only">previous</span></button></th>\n      <th colspan="{{::5 + showWeeks}}"><button id="{{::uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm uib-title" ng-click="toggleMode()" ng-disabled="datepickerMode === maxMode" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right uib-right" ng-click="move(1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-right"></i><span class="sr-only">next</span></button></th>\n    </tr>\n    <tr>\n      <th ng-if="showWeeks" class="text-center"></th>\n      <th ng-repeat="label in ::labels track by $index" class="text-center"><small aria-label="{{::label.full}}">{{::label.abbr}}</small></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="uib-weeks" ng-repeat="row in rows track by $index" role="row">\n      <td ng-if="showWeeks" class="text-center h6"><em>{{ weekNumbers[$index] }}</em></td>\n      <td ng-repeat="dt in row" class="uib-day text-center" role="gridcell"\n        id="{{::dt.uid}}"\n        ng-class="::dt.customClass">\n        <button type="button" class="btn btn-default btn-sm"\n          uib-is-class="\n            \'btn-info\' for selectedDt,\n            \'active\' for activeDt\n            on dt"\n          ng-click="select(dt.date)"\n          ng-disabled="::dt.disabled"\n          tabindex="-1"><span ng-class="::{\'text-muted\': dt.secondary, \'text-info\': dt.current}">{{::dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("uib/template/datepicker/month.html",[]).run(["$templateCache",function(a){a.put("uib/template/datepicker/month.html",'<table role="grid" aria-labelledby="{{::uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left uib-left" ng-click="move(-1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-left"></i><span class="sr-only">previous</span></button></th>\n      <th colspan="{{::yearHeaderColspan}}"><button id="{{::uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm uib-title" ng-click="toggleMode()" ng-disabled="datepickerMode === maxMode" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right uib-right" ng-click="move(1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-right"></i><span class="sr-only">next</span></i></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="uib-months" ng-repeat="row in rows track by $index" role="row">\n      <td ng-repeat="dt in row" class="uib-month text-center" role="gridcell"\n        id="{{::dt.uid}}"\n        ng-class="::dt.customClass">\n        <button type="button" class="btn btn-default"\n          uib-is-class="\n            \'btn-info\' for selectedDt,\n            \'active\' for activeDt\n            on dt"\n          ng-click="select(dt.date)"\n          ng-disabled="::dt.disabled"\n          tabindex="-1"><span ng-class="::{\'text-info\': dt.current}">{{::dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("uib/template/datepicker/year.html",[]).run(["$templateCache",function(a){a.put("uib/template/datepicker/year.html",'<table role="grid" aria-labelledby="{{::uniqueId}}-title" aria-activedescendant="{{activeDateId}}">\n  <thead>\n    <tr>\n      <th><button type="button" class="btn btn-default btn-sm pull-left uib-left" ng-click="move(-1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-left"></i><span class="sr-only">previous</span></button></th>\n      <th colspan="{{::columns - 2}}"><button id="{{::uniqueId}}-title" role="heading" aria-live="assertive" aria-atomic="true" type="button" class="btn btn-default btn-sm uib-title" ng-click="toggleMode()" ng-disabled="datepickerMode === maxMode" tabindex="-1"><strong>{{title}}</strong></button></th>\n      <th><button type="button" class="btn btn-default btn-sm pull-right uib-right" ng-click="move(1)" tabindex="-1"><i aria-hidden="true" class="glyphicon glyphicon-chevron-right"></i><span class="sr-only">next</span></button></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr class="uib-years" ng-repeat="row in rows track by $index" role="row">\n      <td ng-repeat="dt in row" class="uib-year text-center" role="gridcell"\n        id="{{::dt.uid}}"\n        ng-class="::dt.customClass">\n        <button type="button" class="btn btn-default"\n          uib-is-class="\n            \'btn-info\' for selectedDt,\n            \'active\' for activeDt\n            on dt"\n          ng-click="select(dt.date)"\n          ng-disabled="::dt.disabled"\n          tabindex="-1"><span ng-class="::{\'text-info\': dt.current}">{{::dt.label}}</span></button>\n      </td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("uib/template/datepickerPopup/popup.html",[]).run(["$templateCache",function(a){a.put("uib/template/datepickerPopup/popup.html",'<ul role="presentation" class="uib-datepicker-popup dropdown-menu uib-position-measure" dropdown-nested ng-if="isOpen" ng-keydown="keydown($event)" ng-click="$event.stopPropagation()">\n  <li ng-transclude></li>\n  <li ng-if="showButtonBar" class="uib-button-bar">\n    <span class="btn-group pull-left">\n      <button type="button" class="btn btn-sm btn-info uib-datepicker-current" ng-click="select(\'today\', $event)" ng-disabled="isDisabled(\'today\')">{{ getText(\'current\') }}</button>\n      <button type="button" class="btn btn-sm btn-danger uib-clear" ng-click="select(null, $event)">{{ getText(\'clear\') }}</button>\n    </span>\n    <button type="button" class="btn btn-sm btn-success pull-right uib-close" ng-click="close($event)">{{ getText(\'close\') }}</button>\n  </li>\n</ul>\n')}]),angular.module("uib/template/modal/window.html",[]).run(["$templateCache",function(a){a.put("uib/template/modal/window.html","<div class=\"modal-dialog {{size ? 'modal-' + size : ''}}\"><div class=\"modal-content\" uib-modal-transclude></div></div>\n")}]),angular.module("uib/template/pager/pager.html",[]).run(["$templateCache",function(a){a.put("uib/template/pager/pager.html",'<li ng-class="{disabled: noPrevious()||ngDisabled, previous: align}"><a href ng-click="selectPage(page - 1, $event)" ng-disabled="noPrevious()||ngDisabled" uib-tabindex-toggle>{{::getText(\'previous\')}}</a></li>\n<li ng-class="{disabled: noNext()||ngDisabled, next: align}"><a href ng-click="selectPage(page + 1, $event)" ng-disabled="noNext()||ngDisabled" uib-tabindex-toggle>{{::getText(\'next\')}}</a></li>\n')}]),angular.module("uib/template/pagination/pagination.html",[]).run(["$templateCache",function(a){a.put("uib/template/pagination/pagination.html",'<li role="menuitem" ng-if="::boundaryLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="pagination-first"><a href ng-click="selectPage(1, $event)" ng-disabled="noPrevious()||ngDisabled" uib-tabindex-toggle>{{::getText(\'first\')}}</a></li>\n<li role="menuitem" ng-if="::directionLinks" ng-class="{disabled: noPrevious()||ngDisabled}" class="pagination-prev"><a href ng-click="selectPage(page - 1, $event)" ng-disabled="noPrevious()||ngDisabled" uib-tabindex-toggle>{{::getText(\'previous\')}}</a></li>\n<li role="menuitem" ng-repeat="page in pages track by $index" ng-class="{active: page.active,disabled: ngDisabled&&!page.active}" class="pagination-page"><a href ng-click="selectPage(page.number, $event)" ng-disabled="ngDisabled&&!page.active" uib-tabindex-toggle>{{page.text}}</a></li>\n<li role="menuitem" ng-if="::directionLinks" ng-class="{disabled: noNext()||ngDisabled}" class="pagination-next"><a href ng-click="selectPage(page + 1, $event)" ng-disabled="noNext()||ngDisabled" uib-tabindex-toggle>{{::getText(\'next\')}}</a></li>\n<li role="menuitem" ng-if="::boundaryLinks" ng-class="{disabled: noNext()||ngDisabled}" class="pagination-last"><a href ng-click="selectPage(totalPages, $event)" ng-disabled="noNext()||ngDisabled" uib-tabindex-toggle>{{::getText(\'last\')}}</a></li>\n')}]),angular.module("uib/template/tooltip/tooltip-html-popup.html",[]).run(["$templateCache",function(a){a.put("uib/template/tooltip/tooltip-html-popup.html",'<div class="tooltip-arrow"></div>\n<div class="tooltip-inner" ng-bind-html="contentExp()"></div>\n')}]),angular.module("uib/template/tooltip/tooltip-popup.html",[]).run(["$templateCache",function(a){a.put("uib/template/tooltip/tooltip-popup.html",'<div class="tooltip-arrow"></div>\n<div class="tooltip-inner" ng-bind="content"></div>\n')}]),angular.module("uib/template/tooltip/tooltip-template-popup.html",[]).run(["$templateCache",function(a){a.put("uib/template/tooltip/tooltip-template-popup.html",'<div class="tooltip-arrow"></div>\n<div class="tooltip-inner"\n  uib-tooltip-template-transclude="contentExp()"\n  tooltip-template-transclude-scope="originScope()"></div>\n')}]),angular.module("uib/template/popover/popover-html.html",[]).run(["$templateCache",function(a){a.put("uib/template/popover/popover-html.html",'<div class="arrow"></div>\n\n<div class="popover-inner">\n    <h3 class="popover-title" ng-bind="uibTitle" ng-if="uibTitle"></h3>\n    <div class="popover-content" ng-bind-html="contentExp()"></div>\n</div>\n')}]),angular.module("uib/template/popover/popover-template.html",[]).run(["$templateCache",function(a){a.put("uib/template/popover/popover-template.html",'<div class="arrow"></div>\n\n<div class="popover-inner">\n    <h3 class="popover-title" ng-bind="uibTitle" ng-if="uibTitle"></h3>\n    <div class="popover-content"\n      uib-tooltip-template-transclude="contentExp()"\n      tooltip-template-transclude-scope="originScope()"></div>\n</div>\n')}]),angular.module("uib/template/popover/popover.html",[]).run(["$templateCache",function(a){a.put("uib/template/popover/popover.html",'<div class="arrow"></div>\n\n<div class="popover-inner">\n    <h3 class="popover-title" ng-bind="uibTitle" ng-if="uibTitle"></h3>\n    <div class="popover-content" ng-bind="content"></div>\n</div>\n')}]),angular.module("uib/template/progressbar/bar.html",[]).run(["$templateCache",function(a){a.put("uib/template/progressbar/bar.html",'<div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: (percent < 100 ? percent : 100) + \'%\'}" aria-valuetext="{{percent | number:0}}%" aria-labelledby="{{::title}}" ng-transclude></div>\n')}]),angular.module("uib/template/progressbar/progress.html",[]).run(["$templateCache",function(a){a.put("uib/template/progressbar/progress.html",'<div class="progress" ng-transclude aria-labelledby="{{::title}}"></div>')}]),angular.module("uib/template/progressbar/progressbar.html",[]).run(["$templateCache",function(a){a.put("uib/template/progressbar/progressbar.html",'<div class="progress">\n  <div class="progress-bar" ng-class="type && \'progress-bar-\' + type" role="progressbar" aria-valuenow="{{value}}" aria-valuemin="0" aria-valuemax="{{max}}" ng-style="{width: (percent < 100 ? percent : 100) + \'%\'}" aria-valuetext="{{percent | number:0}}%" aria-labelledby="{{::title}}" ng-transclude></div>\n</div>\n')}]),angular.module("uib/template/rating/rating.html",[]).run(["$templateCache",function(a){a.put("uib/template/rating/rating.html",'<span ng-mouseleave="reset()" ng-keydown="onKeydown($event)" tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="{{range.length}}" aria-valuenow="{{value}}" aria-valuetext="{{title}}">\n    <span ng-repeat-start="r in range track by $index" class="sr-only">({{ $index < value ? \'*\' : \' \' }})</span>\n    <i ng-repeat-end ng-mouseenter="enter($index + 1)" ng-click="rate($index + 1)" class="glyphicon" ng-class="$index < value && (r.stateOn || \'glyphicon-star\') || (r.stateOff || \'glyphicon-star-empty\')" ng-attr-title="{{r.title}}"></i>\n</span>\n')}]),angular.module("uib/template/tabs/tab.html",[]).run(["$templateCache",function(a){a.put("uib/template/tabs/tab.html",'<li ng-class="[{active: active, disabled: disabled}, classes]" class="uib-tab nav-item">\n  <a href ng-click="select($event)" class="nav-link" uib-tab-heading-transclude>{{heading}}</a>\n</li>\n')}]),angular.module("uib/template/tabs/tabset.html",[]).run(["$templateCache",function(a){a.put("uib/template/tabs/tabset.html",'<div>\n  <ul class="nav nav-{{tabset.type || \'tabs\'}}" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}" ng-transclude></ul>\n  <div class="tab-content">\n    <div class="tab-pane"\n         ng-repeat="tab in tabset.tabs"\n         ng-class="{active: tabset.active === tab.index}"\n         uib-tab-content-transclude="tab">\n    </div>\n  </div>\n</div>\n')}]),angular.module("uib/template/timepicker/timepicker.html",[]).run(["$templateCache",function(a){a.put("uib/template/timepicker/timepicker.html",'<table class="uib-timepicker">\n  <tbody>\n    <tr class="text-center" ng-show="::showSpinners">\n      <td class="uib-increment hours"><a ng-click="incrementHours()" ng-class="{disabled: noIncrementHours()}" class="btn btn-link" ng-disabled="noIncrementHours()" tabindex="-1"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n      <td>&nbsp;</td>\n      <td class="uib-increment minutes"><a ng-click="incrementMinutes()" ng-class="{disabled: noIncrementMinutes()}" class="btn btn-link" ng-disabled="noIncrementMinutes()" tabindex="-1"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n      <td ng-show="showSeconds">&nbsp;</td>\n      <td ng-show="showSeconds" class="uib-increment seconds"><a ng-click="incrementSeconds()" ng-class="{disabled: noIncrementSeconds()}" class="btn btn-link" ng-disabled="noIncrementSeconds()" tabindex="-1"><span class="glyphicon glyphicon-chevron-up"></span></a></td>\n      <td ng-show="showMeridian"></td>\n    </tr>\n    <tr>\n      <td class="form-group uib-time hours" ng-class="{\'has-error\': invalidHours}">\n        <input type="text" placeholder="HH" ng-model="hours" ng-change="updateHours()" class="form-control text-center" ng-readonly="::readonlyInput" maxlength="2" tabindex="{{::tabindex}}" ng-disabled="noIncrementHours()" ng-blur="blur()">\n      </td>\n      <td class="uib-separator">:</td>\n      <td class="form-group uib-time minutes" ng-class="{\'has-error\': invalidMinutes}">\n        <input type="text" placeholder="MM" ng-model="minutes" ng-change="updateMinutes()" class="form-control text-center" ng-readonly="::readonlyInput" maxlength="2" tabindex="{{::tabindex}}" ng-disabled="noIncrementMinutes()" ng-blur="blur()">\n      </td>\n      <td ng-show="showSeconds" class="uib-separator">:</td>\n      <td class="form-group uib-time seconds" ng-class="{\'has-error\': invalidSeconds}" ng-show="showSeconds">\n        <input type="text" placeholder="SS" ng-model="seconds" ng-change="updateSeconds()" class="form-control text-center" ng-readonly="readonlyInput" maxlength="2" tabindex="{{::tabindex}}" ng-disabled="noIncrementSeconds()" ng-blur="blur()">\n      </td>\n      <td ng-show="showMeridian" class="uib-time am-pm"><button type="button" ng-class="{disabled: noToggleMeridian()}" class="btn btn-default text-center" ng-click="toggleMeridian()" ng-disabled="noToggleMeridian()" tabindex="{{::tabindex}}">{{meridian}}</button></td>\n    </tr>\n    <tr class="text-center" ng-show="::showSpinners">\n      <td class="uib-decrement hours"><a ng-click="decrementHours()" ng-class="{disabled: noDecrementHours()}" class="btn btn-link" ng-disabled="noDecrementHours()" tabindex="-1"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n      <td>&nbsp;</td>\n      <td class="uib-decrement minutes"><a ng-click="decrementMinutes()" ng-class="{disabled: noDecrementMinutes()}" class="btn btn-link" ng-disabled="noDecrementMinutes()" tabindex="-1"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n      <td ng-show="showSeconds">&nbsp;</td>\n      <td ng-show="showSeconds" class="uib-decrement seconds"><a ng-click="decrementSeconds()" ng-class="{disabled: noDecrementSeconds()}" class="btn btn-link" ng-disabled="noDecrementSeconds()" tabindex="-1"><span class="glyphicon glyphicon-chevron-down"></span></a></td>\n      <td ng-show="showMeridian"></td>\n    </tr>\n  </tbody>\n</table>\n')}]),angular.module("uib/template/typeahead/typeahead-match.html",[]).run(["$templateCache",function(a){a.put("uib/template/typeahead/typeahead-match.html",'<a href\n   tabindex="-1"\n   ng-bind-html="match.label | uibTypeaheadHighlight:query"\n   ng-attr-title="{{match.label}}"></a>\n')}]),angular.module("uib/template/typeahead/typeahead-popup.html",[]).run(["$templateCache",function(a){a.put("uib/template/typeahead/typeahead-popup.html",'<ul class="dropdown-menu" ng-show="isOpen() && !moveInProgress" ng-style="{top: position().top+\'px\', left: position().left+\'px\'}" role="listbox" aria-hidden="{{!isOpen()}}">\n    <li class="uib-typeahead-match" ng-repeat="match in matches track by $index" ng-class="{active: isActive($index) }" ng-mouseenter="selectActive($index)" ng-click="selectMatch($index, $event)" role="option" id="{{::match.id}}">\n        <div uib-typeahead-match index="$index" match="match" query="query" template-url="templateUrl"></div>\n    </li>\n</ul>\n')}]),angular.module("ui.bootstrap.carousel").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibCarouselCss&&angular.element(document).find("head").prepend('<style type="text/css">.ng-animate.item:not(.left):not(.right){-webkit-transition:0s ease-in-out left;transition:0s ease-in-out left}</style>'),angular.$$uibCarouselCss=!0}),angular.module("ui.bootstrap.datepicker").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibDatepickerCss&&angular.element(document).find("head").prepend('<style type="text/css">.uib-datepicker .uib-title{width:100%;}.uib-day button,.uib-month button,.uib-year button{min-width:100%;}.uib-left,.uib-right{width:100%}</style>'),angular.$$uibDatepickerCss=!0}),angular.module("ui.bootstrap.position").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibPositionCss&&angular.element(document).find("head").prepend('<style type="text/css">.uib-position-measure{display:block !important;visibility:hidden !important;position:absolute !important;top:-9999px !important;left:-9999px !important;}.uib-position-scrollbar-measure{position:absolute !important;top:-9999px !important;width:50px !important;height:50px !important;overflow:scroll !important;}.uib-position-body-scrollbar-measure{overflow:scroll !important;}</style>'),angular.$$uibPositionCss=!0}),angular.module("ui.bootstrap.datepickerPopup").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibDatepickerpopupCss&&angular.element(document).find("head").prepend('<style type="text/css">.uib-datepicker-popup.dropdown-menu{display:block;float:none;margin:0;}.uib-button-bar{padding:10px 9px 2px;}</style>'),angular.$$uibDatepickerpopupCss=!0}),angular.module("ui.bootstrap.tooltip").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibTooltipCss&&angular.element(document).find("head").prepend('<style type="text/css">[uib-tooltip-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-html-popup].tooltip.right-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.top-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-left > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.bottom-right > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.left-bottom > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-top > .tooltip-arrow,[uib-tooltip-template-popup].tooltip.right-bottom > .tooltip-arrow,[uib-popover-popup].popover.top-left > .arrow,[uib-popover-popup].popover.top-right > .arrow,[uib-popover-popup].popover.bottom-left > .arrow,[uib-popover-popup].popover.bottom-right > .arrow,[uib-popover-popup].popover.left-top > .arrow,[uib-popover-popup].popover.left-bottom > .arrow,[uib-popover-popup].popover.right-top > .arrow,[uib-popover-popup].popover.right-bottom > .arrow,[uib-popover-html-popup].popover.top-left > .arrow,[uib-popover-html-popup].popover.top-right > .arrow,[uib-popover-html-popup].popover.bottom-left > .arrow,[uib-popover-html-popup].popover.bottom-right > .arrow,[uib-popover-html-popup].popover.left-top > .arrow,[uib-popover-html-popup].popover.left-bottom > .arrow,[uib-popover-html-popup].popover.right-top > .arrow,[uib-popover-html-popup].popover.right-bottom > .arrow,[uib-popover-template-popup].popover.top-left > .arrow,[uib-popover-template-popup].popover.top-right > .arrow,[uib-popover-template-popup].popover.bottom-left > .arrow,[uib-popover-template-popup].popover.bottom-right > .arrow,[uib-popover-template-popup].popover.left-top > .arrow,[uib-popover-template-popup].popover.left-bottom > .arrow,[uib-popover-template-popup].popover.right-top > .arrow,[uib-popover-template-popup].popover.right-bottom > .arrow{top:auto;bottom:auto;left:auto;right:auto;margin:0;}[uib-popover-popup].popover,[uib-popover-html-popup].popover,[uib-popover-template-popup].popover{display:block !important;}</style>'),angular.$$uibTooltipCss=!0}),angular.module("ui.bootstrap.timepicker").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibTimepickerCss&&angular.element(document).find("head").prepend('<style type="text/css">.uib-time input{width:50px;}</style>'),angular.$$uibTimepickerCss=!0}),angular.module("ui.bootstrap.typeahead").run(function(){!angular.$$csp().noInlineStyle&&!angular.$$uibTypeaheadCss&&angular.element(document).find("head").prepend('<style type="text/css">[uib-typeahead-popup].dropdown-menu{display:block;}</style>'),angular.$$uibTypeaheadCss=!0});
/**
 * angular-ui-sortable - This directive allows you to jQueryUI Sortable.
 * @version v0.19.0 - 2018-01-14
 * @link http://angular-ui.github.com
 * @license MIT
 */

!function(a,b,c){"use strict";b.module("ui.sortable",[]).value("uiSortableConfig",{items:"> [ng-repeat],> [data-ng-repeat],> [x-ng-repeat]"}).directive("uiSortable",["uiSortableConfig","$timeout","$log",function(a,d,e){return{require:"?ngModel",scope:{ngModel:"=",uiSortable:"=",create:"&uiSortableCreate",start:"&uiSortableStart",activate:"&uiSortableActivate",beforeStop:"&uiSortableBeforeStop",update:"&uiSortableUpdate",remove:"&uiSortableRemove",receive:"&uiSortableReceive",deactivate:"&uiSortableDeactivate",stop:"&uiSortableStop"},link:function(f,g,h,i){function j(a,b){var c="function"==typeof a,d="function"==typeof b;return c&&d?function(){a.apply(this,arguments),b.apply(this,arguments)}:d?b:a}function k(a){var b=a.data("ui-sortable");return b&&"object"==typeof b&&"ui-sortable"===b.widgetFullName?b:null}function l(a){a.children().each(function(){var a=b.element(this);a.width(a.width())})}function m(a,b){return b}function n(b,c){return E[b]?("stop"===b&&(c=j(c,function(){f.$apply()}),c=j(c,v)),c=j(E[b],c)):F[b]&&(c=F[b](c)),c||"items"!==b&&"ui-model-items"!==b||(c=a.items),c}function o(a,d,e){function f(a,b){b in C||(C[b]=null)}b.forEach(E,f);var g=null;if(d){var h;b.forEach(d,function(d,e){if(!(a&&e in a)){if(e in D)return void("ui-floating"===e?C[e]="auto":C[e]=n(e,c));h||(h=b.element.ui.sortable().options);var f=h[e];f=n(e,f),g||(g={}),g[e]=f,C[e]=f}})}return a=b.extend({},a),b.forEach(a,function(b,c){if(c in D){if("ui-floating"!==c||b!==!1&&b!==!0||!e||(e.floating=b),"ui-preserve-size"===c&&(b===!1||b===!0)){var d=C.helper;a.helper=function(a,b){return C["ui-preserve-size"]===!0&&l(b),(d||m).apply(this,arguments)}}C[c]=n(c,b)}}),b.forEach(a,function(a,b){b in D||(a=n(b,a),g||(g={}),g[b]=a,C[b]=a)}),g}function p(a){var c=a.sortable("option","placeholder");if(c&&c.element&&"function"==typeof c.element){var d=c.element();return d=b.element(d)}return null}function q(a,b){var c=C["ui-model-items"].replace(/[^,]*>/g,""),d=a.find('[class="'+b.attr("class")+'"]:not('+c+")");return d}function r(a,b){var c=a.sortable("option","helper");return"clone"===c||"function"==typeof c&&b.item.sortable.isCustomHelperUsed()}function s(a,b){var c=null;return r(a,b)&&"parent"===a.sortable("option","appendTo")&&(c=B),c}function t(a){return/left|right/.test(a.css("float"))||/inline|table-cell/.test(a.css("display"))}function u(a,b){for(var c=0;c<a.length;c++){var d=a[c];if(d.element[0]===b[0])return d}}function v(a,b){b.item.sortable._destroy()}function w(a){return a.parent().find(C["ui-model-items"]).index(a)}function x(){f.$watchCollection("ngModel",function(){d(function(){k(g)&&g.sortable("refresh")},0,!1)}),E.start=function(a,d){if("auto"===C["ui-floating"]){var e=d.item.siblings(),f=k(b.element(a.target));f.floating=t(e)}var h=w(d.item);d.item.sortable={model:i.$modelValue[h],index:h,source:g,sourceList:d.item.parent(),sourceModel:i.$modelValue,cancel:function(){d.item.sortable._isCanceled=!0},isCanceled:function(){return d.item.sortable._isCanceled},isCustomHelperUsed:function(){return!!d.item.sortable._isCustomHelperUsed},_isCanceled:!1,_isCustomHelperUsed:d.item.sortable._isCustomHelperUsed,_destroy:function(){b.forEach(d.item.sortable,function(a,b){d.item.sortable[b]=c})},_connectedSortables:[],_getElementContext:function(a){return u(this._connectedSortables,a)}}},E.activate=function(a,b){var c=b.item.sortable.source===g,d=c?b.item.sortable.sourceList:g,e={element:g,scope:f,isSourceContext:c,savedNodesOrigin:d};b.item.sortable._connectedSortables.push(e),A=d.contents(),B=b.helper;var h=p(g);if(h&&h.length){var i=q(g,h);A=A.not(i)}},E.update=function(a,b){if(!b.item.sortable.received){b.item.sortable.dropindex=w(b.item);var c=b.item.parent().closest("[ui-sortable], [data-ui-sortable], [x-ui-sortable]");b.item.sortable.droptarget=c,b.item.sortable.droptargetList=b.item.parent();var d=b.item.sortable._getElementContext(c);b.item.sortable.droptargetModel=d.scope.ngModel,g.sortable("cancel")}var e=!b.item.sortable.received&&s(g,b,A);e&&e.length&&(A=A.not(e));var h=b.item.sortable._getElementContext(g);A.appendTo(h.savedNodesOrigin),b.item.sortable.received&&(A=null),b.item.sortable.received&&!b.item.sortable.isCanceled()&&(f.$apply(function(){i.$modelValue.splice(b.item.sortable.dropindex,0,b.item.sortable.moved)}),f.$emit("ui-sortable:moved",b))},E.stop=function(a,c){var d="dropindex"in c.item.sortable&&!c.item.sortable.isCanceled();if(d&&!c.item.sortable.received)f.$apply(function(){i.$modelValue.splice(c.item.sortable.dropindex,0,i.$modelValue.splice(c.item.sortable.index,1)[0])}),f.$emit("ui-sortable:moved",c);else if(!d&&!b.equals(g.contents().toArray(),A.toArray())){var e=s(g,c,A);e&&e.length&&(A=A.not(e));var h=c.item.sortable._getElementContext(g);A.appendTo(h.savedNodesOrigin)}A=null,B=null},E.receive=function(a,b){b.item.sortable.received=!0},E.remove=function(a,b){"dropindex"in b.item.sortable||(g.sortable("cancel"),b.item.sortable.cancel()),b.item.sortable.isCanceled()||f.$apply(function(){b.item.sortable.moved=i.$modelValue.splice(b.item.sortable.index,1)[0]})},b.forEach(E,function(a,b){E[b]=j(E[b],function(){var a,c=f[b];"function"==typeof c&&("uiSortable"+b.substring(0,1).toUpperCase()+b.substring(1)).length&&"function"==typeof(a=c())&&a.apply(this,arguments)})}),F.helper=function(a){return a&&"function"==typeof a?function(d,e){var f=e.sortable,h=w(e);e.sortable={model:i.$modelValue[h],index:h,source:g,sourceList:e.parent(),sourceModel:i.$modelValue,_restore:function(){b.forEach(e.sortable,function(a,b){e.sortable[b]=c}),e.sortable=f}};var j=a.apply(this,arguments);return e.sortable._restore(),e.sortable._isCustomHelperUsed=e!==j,j}:a},f.$watchCollection("uiSortable",function(a,b){var c=k(g);if(c){var d=o(a,b,c);d&&g.sortable("option",d)}},!0),o(C)}function y(){i?x():e.info("ui.sortable: ngModel not provided!",g),g.sortable(C)}function z(){return f.uiSortable&&f.uiSortable.disabled?!1:(y(),z.cancelWatcher(),z.cancelWatcher=b.noop,!0)}var A,B,C={},D={"ui-floating":c,"ui-model-items":a.items,"ui-preserve-size":c},E={create:null,start:null,activate:null,beforeStop:null,update:null,remove:null,receive:null,deactivate:null,stop:null},F={helper:null};return b.extend(C,D,a,f.uiSortable),b.element.fn&&b.element.fn.jquery?(z.cancelWatcher=b.noop,void(z()||(z.cancelWatcher=f.$watch("uiSortable.disabled",z)))):void e.error("ui.sortable: jQuery should be included before AngularJS!")}}}])}(window,window.angular);
