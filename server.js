const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const port = 3000;

// API 키
const apiKey = "wwzdQOhIa5pdbgj5zPZubOMQBhB7miR2";

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, "public")));

// 서버와 캐릭터로 데이터 요청
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

// HTML 파일 반환
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 서버 시작
app.listen(port, () => {
  console.log(`서버가 http://localhost:${port}에서 실행 중입니다.`);
});
