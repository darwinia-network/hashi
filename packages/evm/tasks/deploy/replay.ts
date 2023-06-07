import { deployMastercopy } from "@gnosis.pm/zodiac"
import { task } from "hardhat/config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

import type { Hashi__factory } from "../../types/factories/contracts/Hashi__factory"
import type { Yaho__factory } from "../../types/factories/contracts/Yaho__factory"
import type { Yaru__factory } from "../../types/factories/contracts/Yaru__factory"
import type { GiriGiriBashi__factory } from "../../types/factories/contracts/ownable/GiriGiriBashi__factory"
import type { ShoyuBashi__factory } from "../../types/factories/contracts/ownable/ShoyuBashi__factory"
import type { HeaderStorage__factory } from "../../types/factories/contracts/utils/HeaderStorage__factory"
import type { HashiModule__factory } from "../../types/factories/contracts/zodiac/HashiModule__factory"

const ADDRESS_ONE = "0x0000000000000000000000000000000000000001"

export const deploy = async ({ networks }: { networks: string[] }, hre: HardhatRuntimeEnvironment) => {
  const networkList = networks ? networks : Object.keys(hre.config.networks)

  for (const network of networkList) {
    console.log(`\n\x1B[4m\x1B[1m${network.toUpperCase()}\x1B[0m`)

    try {
      hre.changeNetwork(network)
      const [deployer] = await hre.ethers.getSigners()
      const signer = hre.ethers.provider.getSigner(deployer.address)

      // deploy hashi
      console.log(`\x1B[4mHashi\x1B[0m`)
      const hashiFactory: Hashi__factory = <Hashi__factory>await hre.ethers.getContractFactory("Hashi")
      const hashi = await deployMastercopy(signer, hashiFactory, [], hre.ethers.constants.HashZero)

      // deploy yaho
      console.log(`\x1B[4mYaho\x1B[0m`)
      const yahoFactory: Yaho__factory = <Yaho__factory>await hre.ethers.getContractFactory("Yaho")
      const yaho = await deployMastercopy(signer, yahoFactory, [], hre.ethers.constants.HashZero)

      // deploy yaru
      console.log(`\x1B[4mYaru\x1B[0m`)
      const yaruFactory: Yaru__factory = <Yaru__factory>await hre.ethers.getContractFactory("Yaru")
      const yaru = await deployMastercopy(signer, yaruFactory, [hashi, yaho, 1], hre.ethers.constants.HashZero)

      // deploy shoyubashi
      console.log(`\x1B[4mShoyuBashi\x1B[0m`)
      const shoyuBashiFactory: ShoyuBashi__factory = <ShoyuBashi__factory>(
        await hre.ethers.getContractFactory("ShoyuBashi")
      )
      await deployMastercopy(signer, shoyuBashiFactory, [ADDRESS_ONE, hashi], hre.ethers.constants.HashZero)

      // deploy girigiribashi
      console.log(`\x1B[4mGiriGiriBashi\x1B[0m`)
      const giriGiriBashiFactory: GiriGiriBashi__factory = <GiriGiriBashi__factory>(
        await hre.ethers.getContractFactory("GiriGiriBashi")
      )
      await deployMastercopy(
        signer,
        giriGiriBashiFactory,
        [ADDRESS_ONE, hashi, ADDRESS_ONE],
        hre.ethers.constants.HashZero,
      )

      // deploy headstorage
      console.log(`\x1B[4mHeader Storage\x1B[0m`)
      const headerStorageFactory: HeaderStorage__factory = <HeaderStorage__factory>(
        await hre.ethers.getContractFactory("HeaderStorage")
      )
      await deployMastercopy(signer, headerStorageFactory, [], hre.ethers.constants.HashZero)

      // deploy hashi module
      console.log(`\x1B[4mHeader Storage\x1B[0m`)
      const hashiModuleFactory: HashiModule__factory = <HashiModule__factory>(
        await hre.ethers.getContractFactory("HashiModule")
      )
      await deployMastercopy(
        signer,
        hashiModuleFactory,
        [ADDRESS_ONE, ADDRESS_ONE, ADDRESS_ONE, yaru, ADDRESS_ONE, 1],
        hre.ethers.constants.HashZero,
      )
    } catch (error: any) {
      console.log(`  \x1B[31m✘ Network skipped because:\x1B[0m            ${error?.reason || error}`)
    }
  }
}

task(
  "deploy-replay",
  "Replay deployment of all mastercopies on network names provided as arguments. If no networks names are provided, the task will iterate through all networks defined in hardhat.config.ts",
)
  .addOptionalVariadicPositionalParam("networks")
  .setAction(deploy)
