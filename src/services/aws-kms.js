const crypto = require('crypto');

export default ({ aws }) => {
  if (!aws) {
    throw Error(`package aws, crypto are required`, typeof aws);
  }

  const kms = new aws.KMS();
  const algorithm = "aes-256-cbc";

  const decrypt = text => {
    let key = process.env.PG_DATABASE + process.env.PG_HOST;

    key = crypto
      .createHash("sha256")
      .update(String(key))
      .digest("base64")
      .substr(0, 32);

    let iv = "31850b5b911708f79af28613e39c7f99";
    iv = Buffer.from(iv, "hex");
    const encryptedText = Buffer.from(text, "hex");
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  };

  const encrypt = text => {
    let key = process.env.PG_DATABASE + process.env.PG_HOST;

    key = crypto
      .createHash("sha256")
      .update(String(key))
      .digest("base64")
      .substr(0, 32);

    let iv = "31850b5b911708f79af28613e39c7f99";
    iv = Buffer.from(iv, "hex");
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      iv: iv.toString("hex"),
      encryptedData: encrypted.toString("hex")
    };
  };

  const getPw = () => {
    return decrypt(
      "ea5f095b0fe2b893cecec7f1689f06630eb234f2f1258961d0335c152624f129"
    );
  };

  const decyptPromised = () => {
    return new Promise((resolve, reject) => {
      kms.decrypt(
        { CiphertextBlob: Buffer.from(process.env.PG_PASSWORD, "base64") },
        (err, data) => {
          try {
            const password = data.Plaintext.toString("ascii");
            return resolve(password);
          } catch (e) {
            return reject(err);
          }
        }
      );
    });
  };

  return {
    decrypt,
    encrypt,
    getPw,
    decyptPromised
  };
};
