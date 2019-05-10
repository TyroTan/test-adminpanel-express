const hookEventUserQuestion = async ({ sequelize } = {}) => {
  const tableName = `"EventUserQuestions"`;
  const tableColumnName = `event_id`;
  const query = `ALTER TABLE ${tableName} ALTER COLUMN ${tableColumnName} SET NOT NULL;`;
  await sequelize.query(query);
};

export { hookEventUserQuestion };
