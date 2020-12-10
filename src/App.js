import React from "react";
import axios from "axios";
import { Button, Input, notification } from "antd";
import "./App.css";
import QrReader from "react-qr-reader";

const api = process.env.REACT_APP_API_URL;
const renderAmount = (amount) => {
  return Number(amount) / 1e9;
};
const renderAddress = (address, left, right) => {
  const first = address.substring(0, left);
  const last = address.substring(address.length - right, address.length);
  return first + "..." + last;
};
class App extends React.Component {
  state = {
    address: "",
    creatingTx: false,
    show: false,
    error: "",
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
  showModel = (qrcode) => {
    const { isModalVisible } = this.state;
    this.setState({ isModalVisible: !isModalVisible, qrcode });
  };
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
          Address: address.trim(),
          Amount: 10,
        },
      });
      notification.success({
        message: "Successfully",
        description:
          "This faucet is successfully. Waiting for transaction confirm!",
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
  handleScan = (data) => {
    if (data) {
      this.showModel(false);
      this.setState({
        address: data,
      });
    }
  };
  handleError = (err) => {
    alert("Please allow camera permission for browser and this site.");
    console.error(err);
  };
  render() {
    const {
      error,
      creatingTx,
      address,
      requests,
      isModalVisible,
      qrcode,
    } = this.state;
    return (
      <div className="root">
        {isModalVisible && (
          <div className="" id="modal">
            <div className="root-container header-container">
              <img className="logo" src={"./logo.svg"} alt="logo"></img>
              <img
                onClick={() => this.showModel(false)}
                className="close"
                src={"./close.svg"}
                alt="close"
              ></img>
            </div>
            {qrcode ? (
              <div className='root-camera'>
              <div className="camera">
                <QrReader
                  delay={300}
                  onError={this.handleError}
                  onScan={this.handleScan}
                  style={{ width: "100%" }}
                />
              </div>
              </div>
            ) : (
              <div className="mobile-menu">
                <a className="btn-header" href="#top">
                  Testnet Faucet
                </a>
                <a
                  className="btn-header"
                  href="https://docs.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
                <a
                  className="btn-header"
                  href="https://we.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Community
                </a>
              </div>
            )}
          </div>
        )}
        <div className="root-container">
          <div className="header-container">
            <img className="logo" src={"./logo.svg"} alt="logo"></img>
            <div>
              <div className="mobile-text">
                <img
                  onClick={() => this.showModel(false)}
                  className="menu"
                  src={"./menu.svg"}
                  alt="menu"
                ></img>
              </div>
              <div className="desktop-text">
                <a className="btn-header" href="#top">
                  Testnet Faucet
                </a>
                <a
                  className="btn-header"
                  href="https://docs.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Docs
                </a>
                <a
                  className="btn-header"
                  href="https://we.incognito.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Community
                </a>
              </div>
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
              <img
                onClick={() => this.showModel(true)}
                className="qrcode"
                src={"./qrcode.svg"}
                alt="logo"
              ></img>
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
                <th className="desktop">Amount</th>
                <th>Transaction</th>
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
                      {renderAddress(item.address, 18, 5)}
                    </td>
                    <td className="mobile">
                      {renderAddress(item.address, 5, 5)}
                    </td>
                    <td className="desktop">{renderAmount(item.amount)}</td>
                    <td>
                      <a
                        style={{ color: "#d8d8d8" }}
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`https://testnet.incognito.org/tx/${item.tx}`}
                      >
                        {renderAddress(item.tx, 5, 5)}
                      </a>
                    </td>
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
