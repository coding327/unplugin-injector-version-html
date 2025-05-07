import type { Compilation } from 'webpack';

export interface InjectorVersionOptions {
  version?: string;
  injectorFilename?: string;
  log?: boolean;
  callback?: (params: {
    version: string;
    compilation: Compilation;
  }) => void;
}