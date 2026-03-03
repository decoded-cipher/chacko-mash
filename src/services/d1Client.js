/**
 * D1 Client - queries Cloudflare D1 via the official Cloudflare API.
 * Requires CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and D1_DATABASE_ID in .env
 */
const Cloudflare = require('cloudflare').Cloudflare;

let client = null;

function getClient() {
  if (!client) {
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.D1_DATABASE_ID;
    if (!apiToken || !accountId || !databaseId) return null;
    client = new Cloudflare({ apiToken });
    client._accountId = accountId;
    client._databaseId = databaseId;
  }
  return client;
}

const d1Client = {
  get ready() {
    return !!getClient();
  },

  /**
   * Run a parameterized query
   * @param {string} sql - SQL query with ? placeholders
   * @param {any[]} params - Parameters (will be stringified for the API)
   * @returns {Promise<{ results: any[], meta?: object, success: boolean }>}
   */
  async query(sql, params = []) {
    const cf = getClient();
    if (!cf) throw new Error('D1 not configured (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, D1_DATABASE_ID)');

    const queryParams = {
      account_id: cf._accountId,
      sql,
      ...(params.length && { params: params.map(String) }),
    };

    const allResults = [];
    let meta;
    for await (const page of cf.d1.database.query(cf._databaseId, queryParams)) {
      if (page.results) allResults.push(...page.results);
      if (page.meta) meta = page.meta;
    }
    return { results: allResults, meta, success: true };
  },

  /**
   * Run multiple queries sequentially (API doesn't support batch; run one by one)
   * @param {Array<{ sql: string, params?: any[] }>} batch
   * @returns {Promise<any[]>}
   */
  async batch(batch) {
    const results = [];
    for (const { sql, params = [] } of batch) {
      const { results: pageResults } = await this.query(sql, params);
      results.push(pageResults);
    }
    return results;
  },

  async getStudentByDiscordId(discordUserId) {
    const { results } = await this.query(
      'SELECT s.*, d.name as department_name FROM student s LEFT JOIN department d ON s.department_id = d.id WHERE s.discord_user_id = ?',
      [discordUserId]
    );
    return results[0] || null;
  },

  async getStudentsByDepartment(departmentId) {
    const { results } = await this.query('SELECT * FROM student WHERE department_id = ? ORDER BY full_name', [
      departmentId,
    ]);
    return results;
  },

  async getAllDepartments() {
    const { results } = await this.query('SELECT * FROM department ORDER BY name');
    return results;
  },

  /**
   * Get students with birthday on given day/month.
   * @param {number} day - Day of month (1-31)
   * @param {number} month - Month (1-12)
   */
  async getBirthdayStudents(day, month) {
    const { results } = await this.query(
      `SELECT s.*, d.name as department_name 
       FROM student s LEFT JOIN department d ON s.department_id = d.id 
       WHERE CAST(SUBSTR(date_of_birth, 1, INSTR(date_of_birth, '/') - 1) AS INT) = ? 
       AND CAST(SUBSTR(SUBSTR(date_of_birth, INSTR(date_of_birth, '/') + 1), 1, 
           INSTR(SUBSTR(date_of_birth, INSTR(date_of_birth, '/') + 1) || '/', '/') - 1) AS INT) = ?`,
      [month, day]
    );
    return results;
  },

  // --- Birthday helpers (reused by birthday.js, bdayNotify.js) ---

  getStudentDisplayName(student) {
    return student?.full_name || student?.discord_user_id || '';
  },

  parseBirthYear(dateOfBirth) {
    const parts = (dateOfBirth || '').split('/');
    return parseInt(parts[parts.length - 1], 10) || new Date().getFullYear();
  },

  hasCustomAvatar(discordUser) {
    return !!discordUser?.avatar;
  },

  /**
   * Build userData for imageGenerator.generateBirthdayImage from student + Discord user
   */
  toImageGeneratorUserData(student, discordUser) {
    return {
      _id: student.discord_user_id,
      name: this.getStudentDisplayName(student) || discordUser?.username,
      dob: { year: this.parseBirthYear(student.date_of_birth) },
      gender: student.gender || 'Male',
      discord: {
        avatar: discordUser?.displayAvatarURL?.({ extension: 'png', size: 512 }),
        tag: discordUser?.tag || discordUser?.username,
      },
    };
  },
};

module.exports = d1Client;
