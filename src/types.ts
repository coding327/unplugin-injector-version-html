import type { Compilation } from 'webpack';

export interface InjectorVersionOptions {
  version?: string;
  injectorFilename?: string;
  log?: boolean;
  callback?: (compilation: Compilation) => void;
}