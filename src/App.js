/*global kakao*/
import React, { useCallback, useEffect, useState, } from "react";
import { Map, MapMarker } from "react-kakao-maps-sdk";
import "./App.css";
//test
const SearchData = [
  { routeName: "경부선", direction: ["부산", "서울"] },
  { routeName: "남해선", direction: ["부산", "순천"] },
  { routeName: "무안광주선", direction: ["대구", "무안"] },
  { routeName: "광주대구선", direction: ["대구", "순천"] },
  { routeName: "서해안선", direction: ["목포", "시흥"] },
  { routeName: "완주장수선", direction: ["익산", "포항"] },
  { routeName: "대구포항선", direction: ["익산", "포항"] },
  { routeName: "호남선", direction: ["논산", "순천"] },
];

function App() {
  const [data, setData] = useState([{}]);
  const [route, setRoute] = useState("");
  const [direc, setDirec] = useState([]);
  const [selDirect, setSelDirect] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submitKey, setSubmitKey] = useState("");
  const [page, setPage] = useState(1);
  const [oliName, setOliName] = useState("");
  const fetchData = useCallback(async () => {
    const res = await fetch(
      `http://data.ex.co.kr/openapi/business/curStateStation?key=test&type=json&numOfRows=99&pageNo=${page}&routeName=${route}&direction=${selDirect}&serviceAreaName=${submitKey}`
    ).then((res) => res.json());
    console.log(res.list);
    setData(res.list);
  }, [route, selDirect, submitKey, page]);

  useEffect(() => {
    console.log(keyword);
  }, [keyword]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const arr = data.filter((item) => {
    if (item.serviceAreaName) {
      return item;
    }
  });

  // console.log(arr);

  return (
    <div className="App">
      <div className="Direction">
      {SearchData.map((item) => (
        <button
          className="DirectionChoice"
          onClick={() => {
            setDirec(item.direction);
            setRoute(item.routeName);
          }}
          style={{
            backgroundColor:"aqua",
            margin:"1px",
            fontSize:"x-small",
            borderStyle:"none",
            borderRadius:"25%",
            color:"blue",
          }}
        >
          {item.routeName}
        </button>
      ))}
      </div>
      <div className="Search">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitKey(keyword);
          }}
          style={{
            alignItems:"center"
          }}
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="주유소 검색"
            style={{
              margin:"5px",
              height:"20px",
              textAlign:"center"
            }}
          ></input>
          <input
            type="submit"
            value={"검색"}
            style={{
              height:"25px",
            }}
          >
          </input>
        </form>
      </div>
      {direc.map((item) => (
        <button
        style={{
          margin:"5px",
          padding:"5px",
          width:"20%",
          justifySelf:"center"
        }}
          onClick={() => {
            setSelDirect(item);
          }}
        >
          {item}
        </button>
      ))}


      <div className="List">
        {arr.map((item, index) => (
          <li>
            <a
              href="#"
              key={index}
              onClick={() => setOliName(item.serviceAreaName)}
            >
              {item.serviceAreaName}
            </a>
          </li>
        ))}
      </div>
      
      <div></div>

      <div className="leftButton">
        <button onClick={() => setPage((num) => num - 1)}>&lt;</button>
      </div>
      <div className="rightButton">
        <button onClick={() => setPage((num) => num + 1)}>&gt;</button>
      </div>
      <Kakaomap submitKey={oliName} />
    </div>
  );
}

export default App;

function Kakaomap({ submitKey }) {
  const [info, setInfo] = useState();
  const [markers, setMarkers] = useState([]);
  const [map, setMap] = useState();

  useEffect(() => {
    if (!map) return;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(submitKey, (data, status, _pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();
        let markers = [];

        for (var i = 0; i < data.length; i++) {
          // @ts-ignore
          markers.push({
            position: {
              lat: data[i].y,
              lng: data[i].x,
            },
            content: data[i].place_name,
          });
          // @ts-ignore
          bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
        }
        setMarkers(markers);

        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    });
  }, [map, submitKey]);

  return (
    <Map // 로드뷰를 표시할 Container
      center={{
        lat: 37.566826,
        lng: 126.9786567,
      }}
      style={{
        width: "100%",
        height: "250px",
        gridColumn:"1 / span 2"
      }}
      level={4}
      onCreate={setMap}
    >
      {markers.map((marker) => (
        <MapMarker
          key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
          position={marker.position}
          onClick={() => setInfo(marker)}
        >
          {info && info.content === marker.content && (
            <div style={{ color: "#000" }}>{marker.content}</div>
          )}
        </MapMarker>
      ))}
    </Map>
  );
}
