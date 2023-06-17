const express = require("express");
const request = require("supertest");
const { expect } = require("chai");

// Import the router from events.js
const eventsRouter = require("../routes/events");
const userRoutes = require('../routes/user');

let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG5kb2UxQGV4YW1wbGUuY29tIiwiaWF0IjoxNjg2OTg3OTYzLCJleHAiOjE2ODcwMDU5NjN9.x2-IJGUw268SPQVfk76hUqPEayKBC2-zI2iTS1ZG6p4"
let testEventId = "ttAOMxsEXEm9BqFJ8Tag"
let test_email = "newuser1@example.com"
let test_password = "newpassword1"
let test_name = "John Doe"

// Create an Express app and use the events router
const app = express();
app.use(express.json());

app.use("/", eventsRouter);

// reusable boilerplate to be able to get the assert failures
function handleError(done, fn) {
  try { 
      fn();
      done();
  } catch (error) {
      done(error);
  }
}


// Mount the user routes on the app
app.use('/user', userRoutes);

describe('User Routes', function() {
  this.timeout(30000)
  it('should signup a new user', async function() {
    test_email = "newuser1@example.com"
    test_password = "password"
    const response = await request(app)
      .post('/user/signup')
      .set('Content-Type', 'application/json')
      .send({
        email: test_email,
        password: test_password,
        name: 'New User',
        isInCharge: true,
      }).expect(200)

    expect(response.body).to.have.property('token');
  });

  it('should login and return a token', async function() {
    const response = await request(app)
      .post('/user/login')
      .send({ email: test_email, password: test_password })
      .set('Content-Type', 'application/json')
    token = response.body.token
    expect(response.body).to.have.property('token');
  });

  it('should update password for a user', async function() {
    const response = await request(app)
      .put(`/user/forgotPassword?email=${test_email}`)
      .send({ name: test_name, password: test_password })
      .set('Content-Type', 'application/json');
      // test_password = 'newpassword1'
      token = response.body.token
    expect(response.body).to.have.property('token');
  });

  it('should update user details', async function() {
    const response = await request(app)
      .put(`/user?email=${test_email}`)
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send({ email: test_email, name: test_name });

    expect(response.body).to.have.property('email', test_email);
    expect(response.body).to.have.property('name', test_name);
  });
});



describe("Events Router", function(){
  this.timeout(30000)
  describe("GET /", () => {
    it("should return events filtered by start and end dates", async function() {
      const response = await request(app)
        .get("/")
        .query({ start: "2023-06-01", end: "2023-06-30" })
        .set("Authorization", token)
        .expect(200)

      expect(response.body).to.have.property("events");
      expect(response.body.events).to.be.an("array");
    });

    it("should return 401 Unauthorized if token is missing", async () => {
      const response = await request(app).get("/").expect(401);

      expect(response.body).to.deep.equal({ message: "Unauthorized" });
    });
  });

  describe("POST /", async function() {
    it("should create a new event and return it with an ID", async function() {
      const event =   {
        user: test_email,
        date_start: "20-2-2023",
        date_end: "20-2-2023",
        time_start: "19:20",
        time_end: "20:20",
        notify_time_frame_minutes: 20,
        location: "",
        event_name: "",
        extra_data: ""
      };      
      const response = await request(app)
      .post("/")
      .send(event)
      .set("Content-Type", "application/json")
      .set("Authorization", token)

      testEventId = response.body.id
        expect(response.body).to.have.property("id");
        expect(response.body.user).to.equal(event.user);
        expect(response.body.date_start).to.equal(event.date_start);
        expect(response.body.date_end).to.equal(event.date_end);
        expect(response.body.notify_time_frame_minutes).to.equal(event.notify_time_frame_minutes);
        expect(response.body.location).to.equal(event.location);
        expect(response.body.event_name).to.equal(event.event_name);
        expect(response.body.extra_data).to.equal(event.extra_data);
    });

    it("should return 401 Unauthorized if token is missing", async () => {
      const response = await request(app).post("/").expect(401);

      expect(response.body).to.deep.equal({ message: "Unauthorized" });
    });
  });


  describe("PUT /", () => {
    it("should update an existing event", async () => {
      let eventId = testEventId;
      const updatedEvent = { date_start: "21-2-2023", time_start: "19:20" };
      const response = await request(app)
        .put("/")
        .query({ id: eventId })
        .send(updatedEvent)
        .set("Authorization", token)
        .expect(200);

      expect(response.body.date_start).to.equal(updatedEvent.date_start);
      expect(response.body.time_start).to.equal(updatedEvent.time_start);
    });

    it("should return 401 Unauthorized if token is missing", async () => {
      const response = await request(app).put("/").expect(401);

      expect(response.body).to.deep.equal({ message: "Unauthorized" });
    });
  });

  describe("DELETE /", () => {
    it("should delete an existing event", async () => {
      let eventId = testEventId;
      const response = await request(app)
        .delete("/")
        .query({ id: eventId })
        .set("Authorization", token)
        .expect(200);

      expect(response.body).to.deep.equal({ message: `Event with ID ${eventId} deleted` });
    });

    it("should return 401 Unauthorized if token is missing", async () => {
      const response = await request(app).delete("/").expect(401);

      expect(response.body).to.deep.equal({ message: "Unauthorized" });
    });
  });
});

