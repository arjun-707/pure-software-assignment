const axios = require("axios").default;
const fs = require('fs');
const qs = require("qs");
const formidable = require('formidable');
const FormData = require("form-data");
const { getResultURL } = require("./urls");

const getApplication = async () => {
  try {
    const getContents = {
      method: "get",
      url: getResultURL,
      headers: { "content-type": "application/json" },
      data: qs.stringify({}),
    };
    return await axios(getContents);
  } catch (ex) {
    if (ex.response && ex.response.data.error) return { error: ex.response.data.error }
    throw { message: ex.message };
  }
};
const postFormApplication = async (application, files) => {
  try {
    const form = new FormData();
    const app = JSON.stringify(application)
    form.append("application", app, { contentType: 'application/json' });
    form.append("file", fs.createReadStream(files.file));
    form.append("source", fs.createReadStream(files.source));
    const postContents = {
      method: "post",
      url: getResultURL,
      headers: {
        ...form.getHeaders()
      },
      data: form,
    };
    return await axios(postContents);
  } catch (ex) {
    if (ex.response && ex.response.data.error) return { error: ex.response.data.error }
    throw { message: ex.message };
  }
};
const submitApplication = async (body) => {
  try {
    let {
      firstName = "Arjun",
      lastName = "Singh",
      role = "SSE",
      referrer = "Consultant",
      questionId = null,
      sum = null
    } = body
    let application = {}
    if (questionId && sum) {
      application = {
        applicant: { firstName, lastName },
        role,
        referrer,
        answer: { questionId, sum },
      }
    }
    else {
      const { data = null, status = 0 } = await getApplication();
      if (data && status === 200) {
        const { id: questId = null, nums = null, error = null } = data;
        if (error) {
          return {
            error: true,
            errorDesc: error
          }
        }
        if (questId && nums && Array.isArray(nums)) {
          application = {
            applicant: { firstName, lastName },
            role,
            referrer,
            answer: { questionId: questId, sum: nums.reduce((prev, curr) => prev + curr) },
          }
        }
        else {
          return {
            error: true,
            errorDesc: 'invalid question api response',
          };
        }
      }
    }
    const files = {
      file: `${__dirname}/../assets/uploads/resume.pdf`,
      source: `${__dirname}/../assets/uploads/project.zip`,
    }
    const { data: submitData = null, status: submitStatus = 0, error: postError =  null } = await postFormApplication(
      application,
      files
    );
    if (postError) return {
      error: true,
      errorDesc: postError
    }
    if (submitData && submitStatus === 200) {
      return {
        message: submitData.message,
        result: null,
      };
    }
    return {
      error: true,
      errorDesc: ["something went wrong", submitStatus, submitData],
    };
  } catch (ex) {
    // console.trace(ex)
    throw { message: ex.message };
  }
};

module.exports = {
  getApplication,
  submitApplication
}