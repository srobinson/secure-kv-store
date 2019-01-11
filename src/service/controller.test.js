const request = require("supertest");
const App = require("../app");

const encryption_key =
  "223d431872bc579a4d41a88c37110d0d8788bbaf308c25b2f4a9c2452a1258242c9c5df350d7b9a92d9097ffdf29831754b2bf11d13e5e930438370bc8761dda";

const date = Date.now();

const json = {
  account: {
    email: "stu@samui.co",
    screenName: "alphab",
    age: 21,
    passwordSettings: {
      password: "password",
      passwordConfirm: "password",
    },
  },
};

const json2 = {
  something: {
    else: true,
    date,
  },
};

describe("test the store controller", () => {
  test("generate-key::with::no-secret::401", async () => {
    const response = await request(App).get("/generate-key");
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({validations: [{secret: "secret is required"}]});
  });

  test("generate-key::with::secret::200", async () => {
    const secret = "secretsecret";
    const response = await request(App).get(`/generate-key?secret=${secret}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({key: encryption_key});
  });

  test("store::with::no-header::401", async () => {
    const response = await request(App).post(`/store`);
    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({error: {auth: "not authorised"}});
  });

  test("store::with::no-body::400", async () => {
    const response = await request(App)
      .post(`/store`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({validations: [{value: "nothing to store"}]});
  });

  test("store::with::no-id::400", async () => {
    const response = await request(App)
      .post(`/store`)
      .send(json)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({validations: [{id: "no id supplied"}]});
  });

  test("store:with::data-1::200", async () => {
    const id = "data-1";
    const response = await request(App)
      .post(`/store?id=${id}`)
      .send(json)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({upload: "OK"});
  });

  test("store:with::data-2::200", async () => {
    const id = "data-2";
    const response = await request(App)
      .post(`/store?id=${id}`)
      .send(json2)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({upload: "OK"});
  });

  test("search::with::no-header::200", async () => {
    const response = await request(App).get(`/search`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("search::with::no-query::400", async () => {
    const response = await request(App)
      .get(`/search`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({validations: [{q: "no search criteria supplied"}]});
  });

  test("search::with::data-1::200", async () => {
    const id = "data-1";
    const response = await request(App)
      .get(`/search?q=${id}`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{id: "data-1", type: "json", value: json}]);
  });

  test("search::with::data-2::200", async () => {
    const id = "data-2";
    const response = await request(App)
      .get(`/search?q=${id}`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([{id: "data-2", type: "json", value: json2}]);
  });

  test("search::with::data-*::200", async () => {
    const id = "data-*";
    const response = await request(App)
      .get(`/search?q=${id}`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {id: "data-1", type: "json", value: json},
      {id: "data-2", type: "json", value: json2},
    ]);
  });

  test("search::with::data-not-found::200", async () => {
    const id = "data-not-found";
    const response = await request(App)
      .get(`/search?q=${id}`)
      .set("x-kvsec-token", encryption_key);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([]);
  });
});
