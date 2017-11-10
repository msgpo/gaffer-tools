/*
 * Copyright 2017 Crown Copyright
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

angular.module('app').factory('types', ['config', function(config) {

    var service = {};

    var types = {}

    service.initialise = function() {
        types = config.get().types;
    }

    service.getFields = function(className) {
        var knownType = types[className];

        if(knownType) {
            return knownType.fields;
        }

        return unknownType.fields;
    }

    var defaultShortValue = function(value) { // should only be used when no other options are available
        return JSON.stringify(value);
    }

    var unknownType =
    {
        fields: [
            {
                label: "Value",
                type: "text",
                class: "java.lang.String"
            }
        ]
    }

    var getType = function(typeClass) {
        if (types[typeClass]) {
            return types[typeClass];
        }
        return unknownType;
    }

    service.createValue = function(typeClass, parts) {
        if (getType(typeClass).wrapInJson && Object.keys(parts)[0] !== 'undefined' || Object.keys(parts).length > 1) {
            return parts;
        }
        return parts[Object.keys(parts)[0]];
    }

    service.createJsonValue = function(typeClass, parts) {
        var value = {};
        var type = getType(typeClass);

        if(type.wrapInJson || Object.keys(parts).length > 1) {
            if (Object.keys(parts).length === 1 && Object.keys(parts).indexOf('undefined') !== -1) {
                value[typeClass] = parts['undefined'];
            } else {
                value[typeClass] = parts;
            }
            if(stringify) {
                value = JSON.stringify(value);
            }
            return value;
        }

        return parts[Object.keys(parts)[0]];

    }

    service.createParts = function(typeClass, value) {
        if(value[typeClass]) {
            return value[typeClass];
        }

        var parts = {};
        parts[type.key] = value;
        return parts;
    }

    service.getShortValue = function(value) {
        if(typeof value === 'string' || value instanceof String || typeof value === 'number') {
            return value;
        }

        if(Object.keys(value).length != 1) {
            return defaultShortValue(value);
        }

        var typeClass = Object.keys(value)[0]
        var parts = value[typeClass];

        if (Object.keys(parts).length > 0) {
            return Object.keys(parts).map(function(key){return parts[key]}).join("|");
        }

        return value[typeClass];
    }

    service.getCsvHeader = function(typeClass) {
        var type = getType(typeClass);

        var partKeys = [];
        for(var i in type.fields) {
            if(type.fields[i].key === undefined) {
                partKeys.push("");
            } else {
                partKeys.push(type.fields[i].key);
            }
        }

        if(partKeys.length == 0) {
            return "";
        } else {
            return partKeys.join(",");
        }
    }

    return service;

}]);
