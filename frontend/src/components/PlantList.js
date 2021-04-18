import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";

import styled from "styled-components";
import { COLORS } from "../GlobalStyles";

export const PlantList = ({ username, list, title }) => {
  const { loggedIn } = useContext(LoginContext);

  return (
    <Wrapper>
      <Heading to={`/${loggedIn.username}/${title}`}>
        <h1>
          {loggedIn && username === loggedIn.username ? (
            <>your {title}</>
          ) : (
            <>
              {username}'s {title}
            </>
          )}
        </h1>
        <span>{list.length} plants</span>
      </Heading>
      <Plants>
        {list &&
          list.map((plant) => {
            return (
              <Plant key={plant._id} to={`/plants/${plant._id}`}>
                <img src={plant.image} alt={plant.name} />
              </Plant>
            );
          })}
      </Plants>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: 30px 0;
`;

const Heading = styled(Link)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-radius: 20px;
  h1 {
    margin: 0 10px 0 20px;
  }
  span {
    margin: 0 20px 0 10px;
  }
  &:hover {
    background: ${COLORS.light};
    color: ${COLORS.dark};
  }
`;

const Plants = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  border-top: 1px dotted #008000;
  padding-top: 10px;
`;

const Plant = styled(Link)`
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: center;
  margin: 10px;
  border-radius: 20px;
  img {
    height: 150px;
  }
  &:hover {
    color: ${COLORS.darkest};
    box-shadow: 0 0 10px ${COLORS.light};
  }
`;
