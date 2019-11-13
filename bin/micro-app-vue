#!/usr/bin/env node
'use strict';

const { cmd, argv, service } = require('@micro-app/cli/bin/base');

const ncmd = cmd && `vue-service-${cmd}` || cmd;

service.run(ncmd, argv);
