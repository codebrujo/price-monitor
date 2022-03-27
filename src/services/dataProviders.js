const { homeConnectConfig, oauthConfig } = require("../config/constants");
const axios = require("axios");
const url = require('url');
const logger = require("../config/logger");

const getMockHomeappliancesResponse = () => {
  return new Promise((resolve) => {
    const res = [
      {
        name: "Dishwasher Simulator 1",
        brand: "SIEMENS",
        vib: "HCS02DWH1",
        connected: true,
        type: "Dishwasher",
        enumber: "HCS02DWH1/01",
        haId: "SIEMENS-HCS02DWH1-C3209DEA0335",
      },
      {
        name: "Dishwasher Simulator 2",
        brand: "SIEMENS",
        vib: "HCS02DWH2",
        connected: true,
        type: "Dishwasher",
        enumber: "HCS02DWH1/02",
        haId: "SIEMENS-HCS02DWH1-C3209DEA0336",
      },
      {
        name: "Dishwasher Simulator 3",
        brand: "SIEMENS",
        vib: "HCS02DWH3",
        connected: true,
        type: "Dishwasher",
        enumber: "HCS02DWH1/03",
        haId: "SIEMENS-HCS02DWH1-C3209DEA0337",
      },
    ];
    resolve(res);
  });
};

const getMockHomeapplianceResponse = () => {
  return new Promise((resolve) => {
    const res = {
        name: "Dishwasher Simulator 1",
        brand: "SIEMENS",
        vib: "HCS02DWH1",
        connected: true,
        type: "Dishwasher",
        enumber: "HCS02DWH1/01",
        haId: "SIEMENS-HCS02DWH1-C3209DEA0335",
      };
    resolve(res);
  });
};

const getToken = (user) => {
  return user.oauthToken;
};

exports.homeappliances = async (user) => {
  if (homeConnectConfig.isMock) {
    return getMockHomeappliancesResponse();
  }

  const token = getToken(user);
  const res = await axios({
    method: "get",
    url: `${homeConnectConfig.apiUrl}${homeConnectConfig.homeappliancesUrl}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data.homeappliances;
};

exports.homeapplianceByHaId = async (user, haId) => {
  if (homeConnectConfig.isMock) {
    return getMockHomeapplianceResponse();
  }

  const token = getToken(user);
  const res = await axios({
    method: "get",
    url: `${homeConnectConfig.apiUrl}${homeConnectConfig.homeappliancesUrl}/${haId}`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data.data;
};
