exports.checkIntId = (value) => {
  return value.match(/^[0-9]{1,24}$/);
};

exports.waitFor = async (timeout) => {
  await new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
};

const setProperty = async (source, property, record, type) => {
  const value = source[property];
  if (typeof value === 'undefined') {
    return;
  }
  if (type === 'JSON') {
    record[property] = {};
    await record.save();
  }
  record[property] = value;
};

exports.updateModel = async (Model, instance, body, toExclude) => {
  const description = await Model.describe().then((data) => {
    const res = [];
    for (const [key, value] of Object.entries(data)) {
      res.push({
        key,
        type: value.type,
      });
    }
    return res;
  });
  for (const keyValue of description) {
    if (toExclude.find((item) => item === keyValue.key)) continue;
    await setProperty(body, keyValue.key, instance, keyValue.type);
  }
  await instance.save();
  return instance;
};
