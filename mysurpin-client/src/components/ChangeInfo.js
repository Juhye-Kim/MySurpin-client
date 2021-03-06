/* eslint-disable */
import React, { useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { userEdit } from "../actions/index";
import AlertModal from "./AlertModal";
require("dotenv").config();

const ChangeInfo = ({ isChangeInfoFormOn, handleEditUserInfo }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const userState = useSelector((state) => state.userReducer);
  const { user } = userState;

  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState(user.nickname);
  const [password, setPassword] = useState("");
  const [checkpassword, setCheckPassword] = useState("");
  const [message, setMessage] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalComment, setAlertModalComment] = useState("");

  const closeModal = () => {
    setAlertModalOpen(false);
  };

  const MoveToNewPassword = useRef();
  const MoveToNewCheckPassword = useRef();

  const onChangeEmail = useCallback(
    (e) => {
      setEmail(e.target.value);
    },
    [email]
  );
  const onChangeNickname = useCallback(
    (e) => {
      setNickname(e.target.value);
    },
    [nickname]
  );
  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
    },
    [password]
  );
  const onChangeCheckPassword = useCallback(
    (e) => {
      setCheckPassword(e.target.value);
    },
    [checkpassword]
  );

  const onKeyPressMoveToNewPassword = useCallback(
    (e) => {
      if (e.key === "Enter") {
        MoveToNewPassword.current.focus();
      }
    },
    [email, password]
  );

  const onKeyPressMoveToNewCheckPassword = useCallback(
    (e) => {
      if (e.key === "Enter") {
        MoveToNewCheckPassword.current.focus();
      }
    },
    [password, checkpassword]
  );

  const onKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleChangeInfo();
      }
    },
    [checkpassword]
  );

  const handleChangeInfo = () => {
    if (user.email === email && password === checkpassword) {
      const payload = JSON.stringify({
        email,
        password,
        nickname,
      });
      fetch(`${process.env.REACT_APP_SERVER_URL}/user/useredit`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: payload,
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.accessToken) {
            dispatch(userEdit(body.accessToken, email, password, nickname));
            history.push("/");
          } else {
            setAlertModalOpen(true);
            setAlertModalComment("???????????? ????????? ???????????? ????????????.");
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const handleCheck = () => {
    if (email === "") {
      setMessage("???????????? ??????????????????.");
      return;
    }
    if (email === "") {
      setMessage("???????????? ??????????????????.");
      return;
    } else if (!ValidateEmail(email)) {
      setMessage("???????????? ?????? ????????? ?????????.");
      return;
    }
    if (password === "") {
      setMessage("??????????????? ??????????????????.");
    } else if (checkPassword(password)) {
      if (password === checkpassword) {
        setMessage("");
        setEmail("");
        setPassword("");
      } else {
        setMessage("??????????????? ???????????? ??????????????????.");
        return;
      }
    } else {
      if (email === "") {
        setMessage("???????????? ??????????????????");
        return;
      } else if (!ValidateEmail(email)) {
        setMessage("???????????? ?????? ????????? ?????????.");
        return;
      } else setMessage("");
    }
    if (password === "") {
      setMessage("??????????????? ??????????????????.");
      return;
    } else if (checkPassword(password)) {
      handleChangeInfo(email, password);
      return;
    }
  };

  const ValidateEmail = (email) => {
    if (
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
        email
      )
    ) {
      return true;
    }
    return false;
  };

  const checkPassword = (upw) => {
    if (!/^[a-zA-Z0-9]{8,20}$/.test(upw)) {
      setMessage(
        "??????????????? ????????? ????????? ???????????? 8~20????????? ???????????? ?????????."
      );
      return false;
    }
    var chk_num = upw.search(/[0-9]/g);
    var chk_eng = upw.search(/[a-z]/gi);
    if (chk_num < 0 || chk_eng < 0) {
      setMessage("??????????????? ????????? ???????????? ??????????????? ?????????.");
      return false;
    }
    if (/(\w)\1\1\1/.test(upw)) {
      setMessage("??????????????? ?????? ????????? 4??? ?????? ???????????? ??? ????????????.");
      return false;
    } else return true;
  };

  return (
    <div className="changeInfo">
      <AlertModal
        open={alertModalOpen}
        close={closeModal}
        comment={alertModalComment}
      />
      {isChangeInfoFormOn ? (
        <div className="changeinfo__formOn">
          <div className="changeinfo__title">
            <div className="changeinfo__title__text">Edit My Info</div>
            <img src="" alt="" />
          </div>
          <div className="changeinfo__form">
            <input
              type="text"
              className="email__input"
              placeholder="Email ??????????????? ?????? ?????????????????? (?????? ??????)"
              value={email}
              onChange={onChangeEmail}
              onKeyPress={onKeyPressMoveToNewPassword}
            />
            <input
              type="text"
              className="nickname__input"
              placeholder={`${user.nickname} (?????? ??????)`}
              value={nickname}
              onChange={onChangeNickname}
              onKeyPress={onKeyPress}
            />
            <input
              type="password"
              className="passwordnew__input"
              placeholder={"NEW Password"}
              value={password}
              onChange={onChangePassword}
              onKeyPress={onKeyPressMoveToNewCheckPassword}
              ref={MoveToNewPassword}
            />
            <input
              type="password"
              className="passwordcheck__input"
              placeholder="Check Password"
              value={checkpassword}
              onChange={onChangeCheckPassword}
              onKeyPress={onKeyPress}
              ref={MoveToNewCheckPassword}
            />
          </div>
          <button className="changeinfo__btn" onClick={() => handleCheck()}>
            edit
          </button>
          <span>{message}</span>
        </div>
      ) : (
        <div className="changeinfo__formOff">
          <div className="changeinfo__title">Change your info!</div>
          <div className="changeinfo__ment">
            change your name or password maybe you find new surpin spot
          </div>
          <button className="changeinfo__btn" onClick={handleEditUserInfo}>
            edit
          </button>
        </div>
      )}
    </div>
  );
};

export default ChangeInfo;
