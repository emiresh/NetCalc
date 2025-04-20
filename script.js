
function calculateCIDR() {
  const cidrInput = document.getElementById("cidrInput").value.trim();
  const output = document.getElementById("result");
  if (!cidrInput) {
    output.innerHTML = "<p>Please enter a valid CIDR block.</p>";
    return;
  }

  try {
    const [ip, prefixLength] = cidrInput.split("/");
    const network = ip.split(".").map(Number);
    const base = (network[0]<<24)|(network[1]<<16)|(network[2]<<8)|network[3];
    const subnetSize = Math.pow(2, 32 - parseInt(prefixLength));
    const firstHost = base + 1;
    const lastHost = base + subnetSize - 2;
    const broadcast = base + subnetSize - 1;
    const toIP = (int) => [(int>>24)&255, (int>>16)&255, (int>>8)&255, int&255].join(".");
    output.innerHTML = `<p><strong>Network:</strong> ${ip}/${prefixLength}</p>
      <p><strong>Host Range:</strong> ${toIP(firstHost)} - ${toIP(lastHost)}</p>
      <p><strong>Broadcast:</strong> ${toIP(broadcast)}</p>`;
  } catch {
    output.innerHTML = "<p>Invalid CIDR format.</p>";
  }
}



function calculateSubnets() {
  const vpcCidr = document.getElementById("vpcCidrInput").value.trim();
  const subnetCount = parseInt(document.getElementById("subnetCountInput").value.trim());
  const output = document.getElementById("subnetResults");

  if (!vpcCidr || isNaN(subnetCount) || subnetCount < 1) {
    output.innerHTML = "<p>Please enter a valid CIDR block and number of subnets.</p>";
    return;
  }

  try {
    const [baseIp, prefixLength] = vpcCidr.split("/");
    const subnetBits = Math.ceil(Math.log2(subnetCount));
    const newPrefix = parseInt(prefixLength) + subnetBits;

    if (newPrefix > 32) {
      output.innerHTML = "<p>Too many subnets for the given CIDR block.</p>";
      return;
    }

    const baseParts = baseIp.split(".").map(Number);
    const baseInt = (baseParts[0] << 24) | (baseParts[1] << 16) | (baseParts[2] << 8) | baseParts[3];
    const totalSubnets = Math.pow(2, subnetBits);
    const subnetSize = Math.pow(2, 32 - newPrefix);

    let result = `<p><strong>New Subnet Prefix:</strong> /${newPrefix} (${subnetSize - 2} hosts per subnet)</p>`;
    result += "<table><thead><tr><th>Subnet</th><th>Host Range</th><th>Broadcast</th></tr></thead><tbody>";

    for (let i = 0; i < Math.min(subnetCount, totalSubnets); i++) {
      const subnetBaseInt = baseInt + i * subnetSize;

      const firstHostInt = subnetBaseInt + 1;
      const lastHostInt = subnetBaseInt + subnetSize - 2;
      const broadcastInt = subnetBaseInt + subnetSize - 1;

      const toIP = (ipInt) => {
        return [
          (ipInt >>> 24) & 255,
          (ipInt >>> 16) & 255,
          (ipInt >>> 8) & 255,
          ipInt & 255
        ].join(".");
      };

      result += `<tr>
        <td>${toIP(subnetBaseInt)}/${newPrefix}</td>
        <td>${toIP(firstHostInt)} - ${toIP(lastHostInt)}</td>
        <td>${toIP(broadcastInt)}</td>
      </tr>`;
    }

    result += "</tbody></table>";
    output.innerHTML = result;
  } catch (e) {
    output.innerHTML = "<p>Error processing the CIDR block.</p>";
  }
}
