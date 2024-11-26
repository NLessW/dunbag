const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const port = 3000;

const apiKey = "wwzdQOhIa5pdbgj5zPZubOMQBhB7miR2";

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/buffSwitch", async (req, res) => {
  const { server, characterName } = req.query;

  console.log("수신된 서버:", server);
  console.log("수신된 캐릭터명:", characterName);

  if (!server || !characterName) {
    return res.status(400).json({ message: "서버와 캐릭터명을 입력해주세요." });
  }

  try {
    const charSearchUrl = `https://api.neople.co.kr/df/servers/${server}/characters?characterName=${characterName}&apikey=${apiKey}`;
    const charSearchResponse = await axios.get(charSearchUrl);

    if (
      !charSearchResponse.data.rows ||
      charSearchResponse.data.rows.length === 0
    ) {
      return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
    }

    const characterId = charSearchResponse.data.rows[0].characterId;
    console.log("추출된 characterId:", characterId);

    const skillBuffUrl = `https://api.neople.co.kr/df/servers/${server}/characters/${characterId}/skill/buff/equip/equipment?apikey=${apiKey}`;
    const skillBuffResponse = await axios.get(skillBuffUrl);

    const skillStyleUrl = `https://api.neople.co.kr/df/servers/${server}/characters/${characterId}/skill/style?apikey=${apiKey}`;
    const skillStyleResponse = await axios.get(skillStyleUrl);

    const buffSwitchResults = [];

    if (
      skillBuffResponse.data.skill &&
      skillBuffResponse.data.skill.buff &&
      skillBuffResponse.data.skill.buff.skillInfo
    ) {
      const buffSkillInfo = skillBuffResponse.data.skill.buff.skillInfo;
      const skillId = buffSkillInfo.skillId;
      const skillName = buffSkillInfo.name;
      const buffOption = buffSkillInfo.option;
      const buffLevel = buffOption.level;
      const buffPercentage = buffOption.values[1];

      const activeSkills = skillStyleResponse.data.skill.style.active;
      const matchingActiveSkill = activeSkills.find(
        (skill) => skill.skillId === skillId
      );

      if (matchingActiveSkill) {
        const activeSkillLevel = matchingActiveSkill.level;
        const levelDifference = buffLevel - activeSkillLevel;

        buffSwitchResults.push({
          name: skillName,
          skillId: skillId,
          buffLevel: buffLevel,
          activeSkillLevel: activeSkillLevel,
          levelDifference: levelDifference,
          percentage: buffPercentage,
        });
      }
    }

    res.json(buffSwitchResults);
  } catch (error) {
    console.error("오류:", error.message);
    res.status(500).json({
      message: "API 호출 실패",
      error: error.message,
    });
  }
});
app.post("/api/postToDundam", async (req, res) => {
  const { server, characterName } = req.body;

  console.log("수신된 서버:", server);
  console.log("수신된 캐릭터명:", characterName);

  if (!server || !characterName) {
    return res.status(400).json({ message: "서버와 캐릭터명을 입력해주세요." });
  }

  try {
    const charSearchUrl = `https://api.neople.co.kr/df/servers/${server}/characters?characterName=${characterName}&apikey=${apiKey}`;
    const charSearchResponse = await axios.get(charSearchUrl);

    if (
      !charSearchResponse.data.rows ||
      charSearchResponse.data.rows.length === 0
    ) {
      return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
    }

    const characterId = charSearchResponse.data.rows[0].characterId;
    console.log("추출된 characterId:", characterId);

    const url = `https://dundam.xyz/dat/viewData.jsp?image=${characterId}&server=${server}`;
    const headers = {
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      "Content-Type": "application/json",
      Origin: "https://dundam.xyz",
      Referer: "https://dundam.xyz/character",
      "sec-ch-ua":
        '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    };

    const response = await axios.post(url, {}, { headers });
    res.json(response.data);
  } catch (error) {
    console.error("오류:", error.message);
    res.status(500).json({
      message: "Dundam API 호출 실패",
      error: error.message,
    });
  }
});

app.get("/api/fetchData", async (req, res) => {
  const { server, characterName } = req.query;

  if (!server || !characterName) {
    return res.status(400).json({ message: "서버와 캐릭터명을 입력해주세요." });
  }

  try {
    const url = `https://api.neople.co.kr/df/servers/${server}/characters?characterName=${characterName}&apikey=${apiKey}`;
    const response = await axios.get(url);

    if (response.data.rows && response.data.rows.length > 0) {
      const characterId = response.data.rows[0].characterId;
      const detailUrl = `https://api.neople.co.kr/df/servers/${server}/characters/${characterId}/equip/equipment?apikey=${apiKey}`;
      const equipmentData = await axios.get(detailUrl);
      return res.json(equipmentData.data.equipment);
    } else {
      return res.status(404).json({ message: "캐릭터를 찾을 수 없습니다." });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "API 호출에 실패했습니다." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
