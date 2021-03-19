import React from "react";
import { Link } from "react-router-dom";

const Surpin = (props) => {
  const { tags } = props;

  return (
    <Link to="/surpinmodal">
      <div className="surpin">
        <div className="surpin__content">
          <img
            className="surpin__content-thumbnail"
            src="https://ca.slack-edge.com/TR5603XSB-U01GVG58R5W-00ded8765867-512"
            alt="thumbnail"
          />
          <div className="surpin-title">첫번째 서핀리스트</div>
          <div className="surpin-username">beDev</div>
          <ul className="list__tags">
            <li className="list__tag">{tags}#태그</li>
            <li className="list__tag">{tags}#블로깅</li>
            <li className="list__tag">{tags}#추천</li>
            <li className="list__tag">{tags}#추천</li>
            <li className="list__tag">{tags}#코드스테이츠</li>
          </ul>
        </div>
      </div>
    </Link>
  );
};

export default Surpin;
