import React from "react";
import axios from "axios";
import { Button, Input, notification } from "antd";
import "./App.css";
const api = process.env.REACT_APP_API_URL;
const renderAmount = (amount) => {
  return Number(amount) / 1e9;
};
const renderAddress = (address, left) => {
  const first = address.substring(0, left);
  const last = address.substring(address.length - 5, address.length);
  return first + "..." + last;
};
class App extends React.Component {
  state = {
    address: "",
    creatingTx: false,
    show: false,
    error: "",
    result: "No result",
    isModalVisible: false,
    requests: [],
  };
  getRequest = async () => {
    const requests = await axios({
      method: "get",
      url: `${api}/faucet`,
    });
    this.setState({
      requests: requests.data.Data,
    });
  };
  async componentDidMount() {
    await this.getRequest();
  }

  faucet = async () => {
    try {
      this.setState({
        creatingTx: true,
      });
      const { address } = this.state;
      const res = await axios({
        method: "post",
        url: `${api}/faucet`,
        data: {
          Address: address,
          Amount: 10,
        },
      });
      notification.success({
        message: "Successfully",
        description:
          "This faucet is successfully. Waiting for transaction confirm",
      });
      await this.getRequest();
      this.setState({
        result: res && res.data,
        creatingTx: false,
        error: "",
      });
    } catch (error) {
      this.setState({
        creatingTx: false,
        error:
          (error &&
            error.response &&
            error.response.data &&
            error.response.data.Message) ||
          "Error, please try again!",
      });
    }
  };
  render() {
    const { error, creatingTx, address, requests } = this.state;
    return (
      <div className='root'>
        {/* {isModalVisible && (
          <div id="modal">
            <button
              onClick={() => this.setState({ isModalVisible: !isModalVisible })}
            >
              Toglge modal
            </button>
          </div>
        )} */}
        <div className="root-container">
          <div className="header-container">
            <img className="logo" src={"./logo.svg"} alt="logo"></img>
            <div>
              {/* <button onClick={() => this.setState({isModalVisible: !isModalVisible})}>Toglge modal</button> */}
              <Button className="btn-header">Testnet Faucet</Button>
              {/* <Button className="btn-header">Docs</Button> */}
              {/* <Button className="btn-header">Community</Button> */}
            </div>
          </div>
          <div className="body-container">
            <div className="airdrop-container">
              <p className="airdrop-label">
                PRV is the native coin of Incognito.
              </p>
              <p className="airdrop-label desktop-text">
                You can use it to build privacy for the world.{" "}
              </p>

              <p className="airdrop-label mobile-text">
                You can use it to build privacy{" "}
              </p>
              <p className="airdrop-label mobile-text">for the world. </p>
              <p className="airdrop-rule">
                Request a maximum of 10 testnet PRV per address, per 24 hours.{" "}
              </p>
              <Input
                value={address}
                className="input-address"
                onChange={(e) => this.setState({ address: e.target.value })}
                name="address"
                placeholder="Enter Incognito address"
                type="text"
              />
              {error !== "" && <p className="error-message">{error}</p>}
              <Button
                size="large"
                className="btn-faucet"
                disabled={creatingTx}
                onClick={async () => await this.faucet()}
              >
                Give me testnet PRV
              </Button>
            </div>
          </div>
        </div>
        <div className="table-container">
          <p className="request-queue">Request queue</p>
          <table className="table-requests">
            <thead>
              <tr
                style={{
                  color: "white",
                  height: "50px",
                  background: "#1E1E1E",
                  borderRadius: "5px",
                }}
              >
                <th>ID</th>
                <th>Address</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((item, index) => {
                return (
                  <tr
                    key={index}
                    style={index % 2 !== 0 ? { background: "#1E1E1E" } : {}}
                    className="table-content"
                  >
                    <td>{item.id}</td>
                    <td className="desktop">
                      {renderAddress(item.address, 18)}
                    </td>
                    <td className="mobile">{renderAddress(item.address, 5)}</td>
                    <td>{renderAmount(item.amount)}</td>
                    {item.status === 0 && (
                      <td style={{ color: "#FF9500" }}>Pending</td>
                    )}
                    {item.status === 1 && (
                      <td style={{ color: "#0091FF" }}>Processing</td>
                    )}
                    {item.status === 2 && <td>Success</td>}
                    {item.status === 3 && (
                      <td style={{ color: "#E02020" }}>Fail</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
