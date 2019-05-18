const migrationHookEventUserQuestion = async ({ sequelize } = {}) => {
  const tableName = `"EventUserQuestions"`;
  const tableColumnName = `event_id`;
  const query = `ALTER TABLE ${tableName} ALTER COLUMN ${tableColumnName} SET NOT NULL;`;
  await sequelize.query(query);
};

const migrationHookEventUserPoll = async ({ sequelize } = {}) => {
  const tableName = `"event_user_polls"`;
  const tableColumnName = `event_id`;
  const query = `ALTER TABLE ${tableName} ALTER COLUMN ${tableColumnName} SET NOT NULL;`;
  await sequelize.query(query);
};

const migrationHookEventUserPollAnswer = async ({ sequelize } = {}) => {
  const tableName = `"event_user_poll_answers"`;
  // const tableColumnName = `event_id`;
  const query = `ALTER TABLE ${tableName} ADD CONSTRAINT "poll_answer_id" PRIMARY KEY ("user_id", "poll_id")`;
  await sequelize.query(query);
};

// event_poll_id INTEGER NOT NULL REFERENCES "event_user_polls"(event_poll_id),
// event_id INTEGER NOT NULL REFERENCES "Events"(event_id),

const migrationHookEventPollRunning = async ({ sequelize }) => {
  const createTableQuery = `CREATE TABLE IF NOT EXISTS event_poll_running (
      event_poll_running_id serial NOT NULL PRIMARY KEY,
      event_poll_id INTEGER NOT NULL REFERENCES "event_user_polls"(event_poll_id),
      event_id INTEGER NOT NULL REFERENCES "Events"(event_id),
      is_running BOOLEAN NOT NULL
  );`;

  // only one running poll per event_id
  const createConstraintQuery = `CREATE UNIQUE INDEX is_running_idx
    ON event_poll_running (event_id)
    WHERE is_running;
    `;

  await sequelize.query(createTableQuery);
  await sequelize.query(createConstraintQuery);
};

export default migrationHookEventUserQuestion;
export {
  migrationHookEventUserPoll,
  migrationHookEventUserPollAnswer,
  migrationHookEventPollRunning,
  migrationHookEventUserQuestion
};
