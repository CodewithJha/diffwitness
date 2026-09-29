#!/usr/bin/env node
import { runCli } from "./program.js";

const code = await runCli();
process.exitCode = code;
