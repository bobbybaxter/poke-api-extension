import _ from 'lodash';
import { Mock, vi } from 'vitest';

/*
	Used as a shorthand to mock multiple modules
	Example:
	 const mockLog = { log: { info: vi.fn() } };
	  const [customLog, dpLogError, log, bq] = await mockModules([
	    ["helpers/custom-log", "customLog"], // passing a string is the same as passing { customLog: vi.fn() }
	    ["helpers/dp-log-error", { dpLogError: vi.fn() }],
	    ["core/logging/winston/index.js", mockLog], // you can move the object outside of the array if it is complicated
	    ["core/connectors/gcloud/big-query-base-connector"], // if the module exports a default function, you don't need to pass a second argument
	  ]);
*/
export async function mockModules(
  modules: [string, string | null | Record<string, unknown> | Mock<(...args: unknown[]) => unknown> | undefined][],
) {
  return Promise.all(
    modules.map(async ([modulePath, mockFn = null]) => {
      if (mockFn) {
        if (typeof mockFn === 'string') {
          // Mock the named export as a function if a string is provided
          vi.doMock(modulePath, () => ({ [mockFn]: vi.fn() }));
        } else {
          // Mock the default export as a function if an object is provided
          if (typeof mockFn === 'object' && mockFn && !('default' in mockFn)) {
            vi.doMock(modulePath, () => ({ default: {}, ...mockFn }));
          } else {
            vi.doMock(modulePath, () => mockFn);
          }
        }
      } else {
        // Mock the default export as a function if no spec is provided
        vi.doMock(modulePath, () => ({ default: vi.fn() }));
      }

      let module;
      try {
        module = await import(modulePath);
      } catch (e) {
        console.log('Error importing module :>> ', e);
      }

      if (typeof mockFn === 'string') {
        return module?.[mockFn] as unknown as unknown;
      } else if (module && 'default' in module && !_.isEmpty(module?.default)) {
        return module.default;
      } else {
        if (module && 'default' in module) {
          delete module.default;
        }
        return module?.[Object.entries(mockFn || {})[0]?.[0]];
      }
    }),
  );
}
