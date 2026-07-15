const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamelCase(str) {
  return str.replace(/([-_][a-z])/g, group =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
}

function toSnakeCasePayload(obj) {
  const payload = {};
  for (const key in obj) {
    if (key.startsWith('_') || typeof obj[key] === 'function') continue;
    
    let dbKey = toSnakeCase(key);
    if (key === 'user') dbKey = 'user_id';
    else if (key === 'company') dbKey = 'company_id';
    else if (key === 'job') dbKey = 'job_id';
    else if (key === 'candidate') dbKey = 'candidate_id';
    else if (key === 'actor') dbKey = 'actor_id';
    else if (key === 'sender') dbKey = 'sender_id';

    payload[dbKey] = obj[key];
  }
  return payload;
}

function toCamelCasePayload(obj) {
  if (!obj) return obj;
  const result = {};
  for (const key in obj) {
    let jsKey = toCamelCase(key);
    if (key === 'user_id') jsKey = 'user';
    else if (key === 'company_id') jsKey = 'company';
    else if (key === 'job_id') jsKey = 'job';
    else if (key === 'candidate_id') jsKey = 'candidate';
    else if (key === 'actor_id') jsKey = 'actor';
    else if (key === 'sender_id') jsKey = 'sender';

    result[jsKey] = obj[key];
  }
  return result;
}

class DocumentInstance {
  constructor(table, data) {
    this._table = table;
    Object.assign(this, data);
  }

  get _id() {
    return this.id;
  }

  set _id(val) {
    this.id = val;
  }

  get user() {
    return this.userId || this.user_id;
  }

  set user(val) {
    if (val && val.id) {
      this.userId = val.id;
      this.user_id = val.id;
    } else {
      this.userId = val;
      this.user_id = val;
    }
  }

  get company() {
    return this.companyId || this.company_id;
  }

  set company(val) {
    if (val && val.id) {
      this.companyId = val.id;
      this.company_id = val.id;
    } else {
      this.companyId = val;
      this.company_id = val;
    }
  }

  get job() {
    return this.jobId || this.job_id;
  }

  set job(val) {
    if (val && val.id) {
      this.jobId = val.id;
      this.job_id = val.id;
    } else {
      this.jobId = val;
      this.job_id = val;
    }
  }

  get candidate() {
    return this.candidateId || this.candidate_id;
  }

  set candidate(val) {
    if (val && val.id) {
      this.candidateId = val.id;
      this.candidate_id = val.id;
    } else {
      this.candidateId = val;
      this.candidate_id = val;
    }
  }

  get actor() {
    return this.actorId || this.actor_id;
  }

  set actor(val) {
    if (val && val.id) {
      this.actorId = val.id;
      this.actor_id = val.id;
    } else {
      this.actorId = val;
      this.actor_id = val;
    }
  }

  get createdBy() {
    return this.createdById || this.created_by;
  }

  set createdBy(val) {
    if (val && val.id) {
      this.createdById = val.id;
      this.created_by = val.id;
    } else {
      this.createdById = val;
      this.created_by = val;
    }
  }

  async save() {
    // Encrypt password if updated/modified on User
    if (this._table === 'users' && this.password && !this.password.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const payload = toSnakeCasePayload(this);
    let query;
    if (this.id) {
      query = supabase.from(this._table).update(payload).eq('id', this.id);
    } else {
      query = supabase.from(this._table).insert(payload);
    }

    const { data, error } = await query.select().single();
    if (error) throw new Error(error.message);
    
    Object.assign(this, toCamelCasePayload(data));
    return this;
  }

  async matchPassword(enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  }

  toJSON() {
    const copy = { ...this };
    delete copy._table;
    return copy;
  }
}

class QueryBuilder {
  constructor(table, mode, filter = {}) {
    this.table = table;
    this.mode = mode;
    this.filter = filter;
    this.selectFields = '*';
    this.relationsToPopulate = [];
    this.limitCount = null;
    this.sortOption = null;
    this.explicitPassword = false;
  }

  select(fields) {
    if (typeof fields === 'string') {
      if (fields.includes('+password')) {
        this.explicitPassword = true;
      }
      if (fields.includes('-password')) {
        this.explicitPassword = false;
      }
    }
    return this;
  }

  populate(relation) {
    this.relationsToPopulate.push(relation);
    return this;
  }

  sort(sortOption) {
    this.sortOption = sortOption;
    return this;
  }

  limit(count) {
    this.limitCount = count;
    return this;
  }

  async execute() {
    let query = supabase.from(this.table).select(this.selectFields);

    // Apply main filters
    for (const key in this.filter) {
      if (key === '$or') continue;
      const val = this.filter[key];
      
      let dbKey = toSnakeCase(key);
      if (key === 'user') dbKey = 'user_id';
      else if (key === 'company') dbKey = 'company_id';
      else if (key === 'job') dbKey = 'job_id';
      else if (key === 'candidate') dbKey = 'candidate_id';
      else if (key === 'actor') dbKey = 'actor_id';
      else if (key === 'sender') dbKey = 'sender_id';
      else if (key === 'createdBy') dbKey = 'created_by';

      if (val && typeof val === 'object' && !Array.isArray(val)) {
        if (val.$regex) {
          query = query.ilike(dbKey, `%${val.$regex}%`);
        } else {
          for (const op in val) {
            if (op === '$gt') {
              query = query.gt(dbKey, new Date(val[op]).toISOString());
            } else if (op === '$lt') {
              query = query.lt(dbKey, new Date(val[op]).toISOString());
            } else if (op === '$gte') {
              query = query.gte(dbKey, new Date(val[op]).toISOString());
            } else if (op === '$lte') {
              query = query.lte(dbKey, new Date(val[op]).toISOString());
            }
          }
        }
      } else {
        query = query.eq(dbKey, val);
      }
    }

    // Apply OR filter if present
    if (this.filter.$or) {
      const orParts = [];
      for (const cond of this.filter.$or) {
        for (const k in cond) {
          const v = cond[k];
          let dbK = toSnakeCase(k);
          if (k === 'user') dbK = 'user_id';
          else if (k === 'company') dbK = 'company_id';
          else if (k === 'job') dbK = 'job_id';
          else if (k === 'candidate') dbK = 'candidate_id';

          if (v && typeof v === 'object' && v.$regex) {
            orParts.push(`${dbK}.ilike.%${v.$regex}%`);
          } else {
            orParts.push(`${dbK}.eq.${v}`);
          }
        }
      }
      if (orParts.length > 0) {
        query = query.or(orParts.join(','));
      }
    }

    // Sorting
    if (this.sortOption) {
      let isDesc = false;
      let field = '';
      if (typeof this.sortOption === 'string') {
        isDesc = this.sortOption.startsWith('-');
        field = isDesc ? this.sortOption.substring(1) : this.sortOption;
      } else if (typeof this.sortOption === 'object') {
        const firstKey = Object.keys(this.sortOption)[0];
        isDesc = this.sortOption[firstKey] === -1 || this.sortOption[firstKey] === 'desc';
        field = firstKey;
      }
      const col = toSnakeCase(field);
      query = query.order(col, { ascending: !isDesc });
    }

    if (this.limitCount) {
      query = query.limit(this.limitCount);
    }

    if (this.mode === 'one') {
      const { data, error } = await query.maybeSingle();
      if (error) throw new Error(error.message);
      if (!data) return null;
      
      const payload = toCamelCasePayload(data);
      if (this.table === 'users' && !this.explicitPassword) {
        delete payload.password;
      }
      const instance = new DocumentInstance(this.table, payload);
      await this._handlePopulations(instance);
      return instance;
    } else {
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      
      const instances = (data || []).map(d => {
        const payload = toCamelCasePayload(d);
        if (this.table === 'users' && !this.explicitPassword) {
          delete payload.password;
        }
        return new DocumentInstance(this.table, payload);
      });
      
      for (const inst of instances) {
        await this._handlePopulations(inst);
      }
      return instances;
    }
  }

  then(onfulfilled, onrejected) {
    return this.execute().then(onfulfilled, onrejected);
  }

  async _handlePopulations(instance) {
    if (!instance || this.relationsToPopulate.length === 0) return;

    for (let rel of this.relationsToPopulate) {
      if (typeof rel === 'object') {
        rel = rel.path;
      }

      if (rel === 'company' && instance.company) {
        const { data, error } = await supabase.from('companies').select('*').eq('id', instance.company).maybeSingle();
        if (!error && data) {
          instance.company = new DocumentInstance('companies', toCamelCasePayload(data));
        }
      }
      if (rel === 'user' && instance.user) {
        const { data, error } = await supabase.from('users').select('*').eq('id', instance.user).maybeSingle();
        if (!error && data) {
          instance.user = new DocumentInstance('users', toCamelCasePayload(data));
        }
      }
      if (rel === 'job' && instance.job) {
        const { data, error } = await supabase.from('jobs').select('*').eq('id', instance.job).maybeSingle();
        if (!error && data) {
          instance.job = new DocumentInstance('jobs', toCamelCasePayload(data));
        }
      }
      if (rel === 'actor' && instance.actor) {
        const { data, error } = await supabase.from('users').select('*').eq('id', instance.actor).maybeSingle();
        if (!error && data) {
          instance.actor = new DocumentInstance('users', toCamelCasePayload(data));
        }
      }
      if (rel === 'recruiter' && instance.recruiter) {
        const { data, error } = await supabase.from('users').select('*').eq('id', instance.recruiter).maybeSingle();
        if (!error && data) {
          instance.recruiter = new DocumentInstance('users', toCamelCasePayload(data));
        }
      }
      if (rel === 'candidate' && instance.candidate) {
        const { data, error } = await supabase.from('users').select('*').eq('id', instance.candidate).maybeSingle();
        if (!error && data) {
          instance.candidate = new DocumentInstance('users', toCamelCasePayload(data));
        }
      }
      if (rel === 'createdBy' && instance.createdBy) {
        const { data, error } = await supabase.from('users').select('*').eq('id', instance.createdBy).maybeSingle();
        if (!error && data) {
          instance.createdBy = new DocumentInstance('users', toCamelCasePayload(data));
        }
      }
    }
  }
}

class SupabaseModel {
  constructor(table) {
    this.table = table;
  }

  async create(data) {
    if (this.table === 'users' && data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const payload = toSnakeCasePayload(data);
    const { data: inserted, error } = await supabase
      .from(this.table)
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return new DocumentInstance(this.table, toCamelCasePayload(inserted));
  }

  async findById(id) {
    if (!id) return null;
    const { data, error } = await supabase
      .from(this.table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? new DocumentInstance(this.table, toCamelCasePayload(data)) : null;
  }

  findOne(filter) {
    return new QueryBuilder(this.table, 'one', filter);
  }

  find(filter) {
    return new QueryBuilder(this.table, 'many', filter);
  }

  async countDocuments(filter = {}) {
    let query = supabase.from(this.table).select('*', { count: 'exact', head: true });
    for (const key in filter) {
      let dbKey = toSnakeCase(key);
      if (key === 'user') dbKey = 'user_id';
      else if (key === 'company') dbKey = 'company_id';
      else if (key === 'job') dbKey = 'job_id';
      else if (key === 'candidate') dbKey = 'candidate_id';
      query = query.eq(dbKey, filter[key]);
    }
    const { count, error } = await query;
    if (error) throw new Error(error.message);
    return count || 0;
  }

  async deleteOne(filter) {
    let query = supabase.from(this.table).delete();
    for (const key in filter) {
      query = query.eq(toSnakeCase(key), filter[key]);
    }
    const { error } = await query;
    if (error) throw new Error(error.message);
    return { deletedCount: 1 };
  }

  async findByIdAndDelete(id) {
    const { error } = await supabase.from(this.table).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { success: true };
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const payload = toSnakeCasePayload(updateData);
    const { data, error } = await supabase
      .from(this.table)
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ? new DocumentInstance(this.table, toCamelCasePayload(data)) : null;
  }
}

module.exports = SupabaseModel;
