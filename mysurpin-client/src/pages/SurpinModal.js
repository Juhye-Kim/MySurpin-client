import React, { useState, useEffect, useRef } from "react";
import UrlList from "../components/UrlList";
import Tag from "../components/Tag";
import { useHistory, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getShowSurpin } from "../actions/index";
import useCheckToken from "../hooks/useCheckToken";
import AlertModal from "../components/AlertModal";
require("dotenv").config();
const awsController = require("../aws_controller/aws_controller");

const SurpinModal = ({ location }) => {
  const history = useHistory();
  const { listId } = useParams();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.userReducer);
  const surpinState = useSelector((state) => state.surpinReducer);
  const {
    user: { nickname, token, email },
  } = userState;
  const { showSurpin } = surpinState;

  const moveToUrl = useRef();

  const {
    surpinId,
    title,
    writer,
    desc,
    tags,
    thumbnail,
    created_At,
    modified_At,
  } = location.surpin || {
    surpinId: 0,
    title: "New Surpin",
    writer: nickname,
    desc: "no description",
    tags: [],
    thumbnail: "",
    createdAt: "",
    modifiedAt: "",
  };

  const [editmode, setEditMode] = useState(false);
  const [newListname, setNewListname] = useState(title);
  const [newDesc, setNewDesc] = useState(desc);
  const [newTags, setNewTags] = useState(tags);
  const [newUrls, setNewUrls] = useState([]);
  const [newExistTags, setNewExistTags] = useState(["tag"]);
  const [newThumbnail, setNewThumbnail] = useState(
    `https://source.unsplash.com/random?${Math.floor(
      Math.random() * 100
    )}/1600x900?blue,water`
  );

  const [inputListname, setInputListname] = useState(title || "New Surpin");
  const [inputDesc, setInputDesc] = useState(desc || "no description");
  const [inputTag, setInputTag] = useState("");
  const [inputUrlname, setInputUrlname] = useState();
  const [inputUrl, setInputUrl] = useState("");

  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalComment, setAlertModalComment] = useState("");
  const closeModal = () => {
    setAlertModalOpen(false);
  };

  const copySurpin = () => {};

  useCheckToken([editmode]);

  useEffect(() => {
    document.title = "Surpin Modal";
    if (!location.surpin) {
      setEditMode(true);
    }
  });

  // showexiststag
  useEffect(() => {
    if (inputTag.length > 0) {
      fetch(
        `${process.env.REACT_APP_SERVER_URL}/tag/showexiststags?inputText=${inputTag}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            credentials: "include",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setNewExistTags(data.tags);
        })
        .catch((err) => console.log(err));
    }
  }, [inputTag]);

  // showsurpin/listid
  useEffect(() => {
    fetch(
      `${process.env.REACT_APP_SERVER_URL}/surpin/showsurpin?listId=${surpinId}`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ email }),
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setNewUrls([...data.urls]);
        dispatch(getShowSurpin(data.urls));
      })
      .catch((err) => console.log(err));
  }, []);

  const setInputThumbnail = () => {
    if (
      document.querySelector("#sidebar__thumbnail__input").files[0].size >
      20 * 1024 * 1024
    ) {
      setAlertModalOpen(true);
      setAlertModalComment("2MB 이하의 파일만 등록가능합니다.");
    }
  };

  const handleInputTagBtn = () => {
    setNewTags([...newTags, inputTag]);
  };

  const handleInputUrlBtn = () => {
    if (!inputUrlname || inputUrlname.length === 0) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/surpin/showurltitle`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ url: inputUrl }),
      })
        .then((res) => res.json())
        .then((body) => {
          setNewUrls([...newUrls, { name: body.title, url: inputUrl }]);
        })
        .catch((err) => console.log(err));
    } else {
      setNewUrls([...newUrls, { name: inputUrlname, url: inputUrl }]);
    }
  };

  const createSurpin = async (listname, desc) => {
    setEditMode(!editmode);

    let thumbnail = newThumbnail;
    if (document.querySelector("#sidebar__thumbnail__input").files.length > 0) {
      thumbnail = await awsController.uploadSurpinThumbnail(
        email,
        document.querySelector("#sidebar__thumbnail__input").files
      );
    }

    const newSurpinState = {
      thumbnail,
      listname,
      desc,
      tags: newTags,
      urls: newUrls,
    };

    fetch(`${process.env.REACT_APP_SERVER_URL}/surpin/createmysurpin`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({ ...newSurpinState, email }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.message === "done") {
          setAlertModalOpen(true);
          setAlertModalComment("서핀 생성 완료");
          setTimeout(() => {
            history.push(`/surpinlists/${nickname}`);
          }, 800);
        } else {
          setAlertModalOpen(true);
          setAlertModalComment(body.message);
        }
      })
      .catch((err) => console.log(err));
  };

  const editSurpin = async (listname, desc) => {
    setEditMode(!editmode);

    let changeThumbnail = newThumbnail;

    if (document.querySelector("#sidebar__thumbnail__input").files.length > 0) {
      if (thumbnail.split("/")[2] === "photo.mysurpin.com") {
        changeThumbnail = await awsController.changeSurpinThumbnail(
          thumbnail,
          document.querySelector("#sidebar__thumbnail__input").files
        );
      } else {
        changeThumbnail = await awsController.uploadSurpinThumbnail(
          email,
          document.querySelector("#sidebar__thumbnail__input").files
        );
      }
    }

    const newSurpinState = {
      thumbnail: changeThumbnail,
      listname,
      desc,
      tags: newTags,
      urls: newUrls,
    };

    fetch(`${process.env.REACT_APP_SERVER_URL}/surpin/editmysurpin`, {
      method: "PATCH",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({ ...newSurpinState, listId: surpinId, email }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.message === "edit done!") {
          setAlertModalOpen(true);
          setAlertModalComment("서핀 수정 완료");
          setTimeout(() => {
            history.push(`/surpinlists/${nickname}`);
          }, 800);
        } else {
          setAlertModalOpen(true);
          setAlertModalComment(body.message);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleRemoveSurpin = () => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/surpin/removemysurpin`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        credentials: "include",
      },
      body: JSON.stringify({ listId: surpinId, email }),
    })
      .then((res) => res.json())
      .then((body) => {
        if (body.message === "Successfully processed") {
          setAlertModalOpen(true);
          setAlertModalComment("삭제 완료");
          history.goBack();
        } else {
          setAlertModalOpen(true);
          setAlertModalComment("삭제 실패");
        }
      })
      .catch((err) => console.log(err));
  };

  const handleSaveSurpin = () => {
    setEditMode(false);
    setNewListname(inputListname);
    setNewDesc(inputDesc);
    if (!location.surpin || writer !== nickname) {
      createSurpin(inputListname, inputDesc);
    } else editSurpin(inputListname, inputDesc);
  };

  const handleDeleteTag = (e) => {
    setNewTags(
      newTags.filter(
        (tag) => tag != e.target.parentNode.textContent.slice(0, -1)
      )
    );
  };

  const handleDeleteUrl = (e) => {
    setNewUrls(
      newUrls.filter(
        (url) =>
          url.name + url.url !== e.target.parentNode.textContent.slice(0, -1)
      )
    );
  };

  return (
    <div className="surpinModal">
      <AlertModal
        open={alertModalOpen}
        close={closeModal}
        comment={alertModalComment}
      />
      <button className="surpinModal__back-btn" onClick={() => history.go(-1)}>
        <img src="/images/go_back_Button.png" alt=""></img>
      </button>
      <section className="surpinModal__sidebar">
        <div
          className="sidebar__listinfo__thumbnail"
          style={{
            backgroundImage: `url(${thumbnail})`,
            backgroundSize: `cover`,
          }}
        >
          {editmode ? (
            <input
              className="sidebar__listinfo__title"
              type="text"
              placeholder={title}
              onChange={(e) => setInputListname(e.target.value)}
              value={inputListname}
            ></input>
          ) : (
            <div className="sidebar__listinfo__title">{newListname}</div>
          )}

          <div
            className="sidebar__listinfo__writer"
            onClick={() => history.push(`/surpinlists/${writer}`)}
          >
            {editmode ? nickname : writer}
          </div>
        </div>
        <div className="sidebar__description">
          <div className="description__title">Description</div>
          {editmode ? (
            <textarea
              className="description__text"
              placeholder={desc}
              onChange={(e) => setInputDesc(e.target.value)}
              value={inputDesc}
            ></textarea>
          ) : (
            <div className="description__text">{newDesc}</div>
          )}
        </div>
        <div className="sidebar__taglists">
          <div className="taglists__form__text">Tags</div>
          {editmode ? (
            <div className="taglists__form">
              <input
                type="text"
                className={`${
                  inputTag === "" ? "highlight" : ""
                } taglists__form__input`}
                placeholder="태그를 추가하세요 *"
                onChange={(e) => setInputTag(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleInputTagBtn();
                    setInputTag("");
                  }
                }}
                value={inputTag}
                list="existTagsList"
              />
              <datalist id="existTagsList">
                {newExistTags.map((existTag) => {
                  return <option value={existTag.name}> </option>;
                })}
              </datalist>
              <button
                className="taglists__form__btn"
                onClick={handleInputTagBtn}
              >
                +
              </button>
            </div>
          ) : (
            <></>
          )}

          <ul className="taglists__show">
            {newTags.length > 0 ? (
              newTags.map((tag) => {
                return (
                  <li className="taglists__show__tag">
                    <Tag tag={tag}></Tag>
                    {editmode ? (
                      <button
                        className="tagaList__delete-btn"
                        onClick={handleDeleteTag}
                      >
                        X
                      </button>
                    ) : (
                      <></>
                    )}
                  </li>
                );
              })
            ) : (
              <></>
            )}
          </ul>
        </div>
        {editmode ? (
          <>
            <label for="sidebar__thumbnail__input">썸네일 등록</label>
            <input
              type="file"
              id="sidebar__thumbnail__input"
              onChange={setInputThumbnail}
            ></input>
          </>
        ) : (
          <></>
        )}
      </section>

      <section className="surpinModal__main">
        <div className="surpinModal__header">
          {writer === nickname ? (
            <button
              className="surpinModal__edit-btn"
              onClick={() => setEditMode(!editmode)}
            >
              <img src="" alt="" />
              {editmode ? "EDIT DONE" : "EDIT MODE"}
            </button>
          ) : (
            <button
              className="surpinModal__edit-btn"
              onClick={() => setEditMode(!editmode)}
            >
              <img src="" alt="" />내 서핀에 저장하기
            </button>
          )}
        </div>
        <span className="surpinModal__url__title">
          {editmode ? "URL 리스트 수정하기" : "URL 리스트"}
        </span>
        <div className="surpinModal__show-contents__topbar">
          <div className="show-contents__urlname">URL NAME</div>
          <div className="show-contents__url">URL</div>
        </div>
        <div className="surpinModal__show-contents">
          <ul className="surpinModal__url-lists">
            {newUrls.length > 0 ? (
              newUrls.map((urlinfo) => {
                return (
                  <li
                    className="surpinModal__url-list"
                    onClick={() => {
                      window.open(urlinfo.url);
                    }}
                  >
                    <UrlList name={urlinfo.name} url={urlinfo.url}></UrlList>
                    {editmode ? (
                      <button
                        className="urlList__delete-btn"
                        onClick={handleDeleteUrl}
                      >
                        X
                      </button>
                    ) : (
                      <></>
                    )}
                  </li>
                );
              })
            ) : (
              <></>
            )}
          </ul>
        </div>
        {editmode ? (
          <div className="surpinModal__input-contents">
            <input
              type="text"
              className="input-content__urlname"
              placeholder="이름을 지정하세요"
              onChange={(e) => setInputUrlname(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  moveToUrl.current.focus();
                }
              }}
              value={inputUrlname}
            />
            <input
              type="text"
              className={`${
                inputUrl === "" ? "highlight" : ""
              } input-content__url `}
              placeholder="url을 입력하세요 *"
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleInputUrlBtn();
                  setInputUrlname("");
                  setInputUrl("");
                }
              }}
              value={inputUrl}
              ref={moveToUrl}
            />
            <button className="input-content__btn" onClick={handleInputUrlBtn}>
              +
            </button>
          </div>
        ) : (
          <></>
        )}
        {editmode ? (
          <>
            <div className="surpinModal__revise-btn__wrapper">
              {writer === nickname && location.surpin ? (
                <button
                  className="surpinModal__revise-btn"
                  onClick={handleSaveSurpin}
                >
                  편집완료
                </button>
              ) : (
                <button
                  className="surpinModal__revise-btn"
                  onClick={handleSaveSurpin}
                >
                  내 서핀에 추가
                </button>
              )}
              {writer === nickname && location.surpin ? (
                <button
                  className="surpinModal__revise-btn"
                  onClick={handleRemoveSurpin}
                >
                  삭제
                </button>
              ) : (
                <></>
              )}
            </div>
          </>
        ) : (
          <></>
        )}
      </section>
    </div>
  );
};

export default SurpinModal;
