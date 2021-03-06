/* eslint-disable */
import React, { useState, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import AlertModal from "./AlertModal";
import { useSelector, useDispatch } from "react-redux";
require("dotenv").config();

const SignUp = ({ isSignInOn, handlePageState, handleGoogleLogin }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const googleTokenState = useSelector((state) => state.userReducer);
  const { googleToken } = googleTokenState;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordcheck, setPasswordCheck] = useState("");
  const [message, setMessage] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertModalComment, setAlertModalComment] = useState("");

  const moveToEmail = useRef();
  const moveToPassword = useRef();
  const moveToCheckPassword = useRef();

  const closeModal = useCallback(() => {
    setAlertModalOpen(false);
  }, [alertModalOpen]);

  const onChangePasswordCheck = useCallback(
    (e) => {
      setPasswordCheck(e.target.value);
      setMessage(e.target.value !== password);
    },
    [password, passwordcheck, message]
  );

  const onChangeName = useCallback(
    (e) => {
      setName(e.target.value);
    },
    [name]
  );

  const onChangeEmail = useCallback(
    (e) => {
      setEmail(e.target.value);
    },
    [email]
  );

  const onChangePassword = useCallback(
    (e) => {
      setPassword(e.target.value);
    },
    [password]
  );

  const onKeyPressMoveToEmail = useCallback(
    (e) => {
      if (e.key === "Enter") {
        moveToEmail.current.focus();
        handleClick();
      }
    },
    [name, email]
  );

  const onKeyPressMoveToPassword = useCallback(
    (e) => {
      if (e.key === "Enter") {
        moveToPassword.current.focus();
        handleClick();
      }
    },
    [email, password]
  );

  const onKeyPressMoveToPasswordCheck = useCallback(
    (e) => {
      if (e.key === "Enter") {
        moveToCheckPassword.current.focus();
        handleClick();
      }
    },
    [password, passwordcheck]
  );

  const onKeyPressSignUp = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleClick();
      }
    },
    [passwordcheck]
  );

  const handleSignUpWithGoogle = () => {
    if (googleToken && googleToken.length > 0) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/user/googleSignUp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify({ data: googleToken }),
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.message !== "Successfully processed") {
            setAlertModalOpen(true);
            setAlertModalComment("???????????? ???????????????.");
          } else if (body.message === "Successfully processed") {
            setAlertModalOpen(true);
            setAlertModalComment("???????????? ??????????????????.");
            setTimeout(() => history.push("/signpage"), 800);
            handlePageState();
          }
        })
        .catch((err) => console.log(err));
    } else {
      handleGoogleLogin("signUp");
    }
  };

  const handleSignUp = () => {
    if (password === passwordcheck) {
      const payload = JSON.stringify({
        nickname: name,
        email,
        password,
      });
      fetch(`${process.env.REACT_APP_SERVER_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: payload,
      })
        .then((res) => res.json())
        .then((body) => {
          if (body.message === "Successfully processed") {
            setMessage("??????????????? ?????????????????????.");
            setAlertModalOpen(true);
            setAlertModalComment("??????????????? ?????????????????????.");
          } else {
            setMessage("????????? ???????????????.");
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const handleClick = useCallback(() => {
    if (name === "") {
      setMessage("????????? ??????????????????.");
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
      if (passwordcheck === "") {
        setMessage("??????????????? ?????? ??????????????????.");
        return;
      } else if (password === passwordcheck) {
        setMessage("");
        setName("");
        setEmail("");
        setPassword("");
      } else {
        setMessage("??????????????? ???????????? ??????????????????.");
        setPasswordCheck("");
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
      handleSignUp(email, password);
      return;
    }
  }, [name, email, password, passwordcheck, message]);

  const ValidateEmail = useCallback(
    (email) => {
      if (
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          email
        )
      ) {
        return true;
      }
      return false;
    },
    [email]
  );

  const checkPassword = useCallback(
    (upw) => {
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
    },
    [password, message]
  );

  return (
    <div className="signUp">
      <AlertModal
        open={alertModalOpen}
        close={closeModal}
        comment={alertModalComment}
      />
      {isSignInOn ? (
        <div className="signup__formOff">
          <div className="signup__title">Sign Up Surpin</div>
          <div className="signup__ment">sign up and make your own surpin!</div>
          <button className="signup__btn" onClick={() => handlePageState()}>
            signup
          </button>
        </div>
      ) : (
        <div>
          <div className="signup__formOn">
            <div className="signup__title">Sign Up Surpin</div>
            <button
              className="google-login__logo"
              onClick={handleSignUpWithGoogle}
            >
              G<img src="../../public/images/logo-google.png" alt=""></img>
            </button>
            <div className="signup__ment">
              sign up and make your own surpin!
            </div>
            <div className="signup-form">
              <input
                className="signup-form__name__input"
                value={name}
                required
                placeholder="Name"
                onChange={onChangeName}
                onKeyPress={onKeyPressMoveToEmail}
              ></input>
              <input
                className="signup-form__email__input"
                value={email}
                required
                placeholder="Email"
                onChange={onChangeEmail}
                onKeyPress={onKeyPressMoveToPassword}
                ref={moveToEmail}
              ></input>
              <input
                className="signup-form__password__input"
                type="password"
                value={password}
                required
                placeholder="Password"
                onChange={onChangePassword}
                onKeyPress={onKeyPressMoveToPasswordCheck}
                ref={moveToPassword}
              ></input>
              <input
                className="signup-form__password__check__input"
                type="password"
                value={passwordcheck}
                required
                placeholder="PasswordCheck"
                onChange={onChangePasswordCheck}
                onKeyPress={onKeyPressSignUp}
                ref={moveToCheckPassword}
              ></input>
            </div>
            <button className="signup__btn" onClick={() => handleClick()}>
              sign up
            </button>
            <span className="signup__message">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
export default SignUp;
