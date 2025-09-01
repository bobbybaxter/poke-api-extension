import { mockCreateServer } from 'src/tests/setup/mock-server';
import supertest from 'supertest';

async function getInternalReqHeaders() {
  // const { PIPELINE_AUTH } = await config.getConfig();
  // return { reqHeader: 'x-pipelines-auth', reqValue: PIPELINE_AUTH };
}

export const { server } = await mockCreateServer();
// export const internalReqHeaders = await getInternalReqHeaders();
export const request = supertest(server);
