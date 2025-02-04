import {
    Container,
    Group,
    Image,
    Text,
    useMantineColorScheme,
    ActionIcon,
    useComputedColorScheme,
    Button,
    Tooltip
} from '@mantine/core';
import { IconSun, IconMoon, IconHelpSmall, IconInfoSmall, IconReport, IconPencil } from '@tabler/icons-react';
import cx from 'clsx';
import classes from './style/Navbar.module.css';
import logo from '../../public/images/wfcommons-vertical.png';
import { AboutModal } from "~/components/AboutModal";
import { HelpModal } from "~/components/HelpModal";
import { UsageStatsModal } from './UsageStatsModal';
import { QuestionnairesModal } from "./QuestionnairesModal"; 
import { useDisclosure } from "@mantine/hooks";


export function Navbar() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    const [openedAboutModal, { open: openAboutModal, close: closeAboutModal }] = useDisclosure(false);
    const [openedHelpModal, { open: openHelpModal, close: closeHelpModal }] = useDisclosure(false);
    const [openedStatsModal, { open: openStatsModal, close: closeStatsModal }] = useDisclosure(false);
    const [openedQuestionnaireModal, { open: openQuestionnaireModal, close: closeQuestionnaireModal }] = useDisclosure(false);

    const otherLightDarkMode = (computedColorScheme === 'light' ? 'dark' : 'light');

    const lightDarkTooltipMessage = "Switch to " + otherLightDarkMode + " mode";


    return (
        <header className={classes.header}>
            <AboutModal opened={openedAboutModal} onClose={closeAboutModal} />
            <HelpModal opened={openedHelpModal} onClose={closeHelpModal} />
            <UsageStatsModal opened={openedStatsModal} onClose={closeStatsModal} />
            <QuestionnairesModal opened={openedQuestionnaireModal} onClose={closeQuestionnaireModal} />
            <Container className={classes.inner} size="xl">
                <Group gap={5}>
                    <a href={"https://wfcommons.org"} target={"_blank"} rel={"noreferrer"}>
                        <Image className={classes.logo} src={logo} />
                    </a>
                    <Text fw={500} style={{ fontSize: '32px', marginBottom: '30px', marginLeft: '10px' }}>WfInstances browser</Text>
                </Group>
                <Group gap={5} visibleFrom="xs">

                    <Tooltip label="Usage Report" position="bottom">
                        <ActionIcon variant="default" size='lg' onClick={() => { openStatsModal(); }}><IconReport stroke={1.5} size={20} /></ActionIcon>
                    </Tooltip>

                    <Tooltip label="User Survey" position="bottom">
                        <ActionIcon variant="default" size='lg' onClick={() => { openQuestionnaireModal(); }}><IconPencil stroke={1.5} size={20} /></ActionIcon>
                    </Tooltip>

                    <Tooltip label="Help..." position="bottom">
                        <ActionIcon variant="default" size='lg' onClick={() => { openHelpModal(); }} ><IconHelpSmall size={50} /></ActionIcon>
                    </Tooltip>

                    <Tooltip label="About..." position="bottom">
                        <ActionIcon variant="default" size='lg' onClick={() => { openAboutModal(); }}><IconInfoSmall size={50} /></ActionIcon>
                    </Tooltip>

                    <Tooltip label={lightDarkTooltipMessage} position="bottom">
                        <ActionIcon
                            onClick={() => setColorScheme(otherLightDarkMode)}
                            variant='default'
                            size='lg'
                            aria-label='Toggle site color scheme'
                        >
                            <IconSun className={cx(classes.icon, classes.light)} stroke={1.5} />
                            <IconMoon className={cx(classes.icon, classes.dark)} stroke={1.5} />
                        </ActionIcon>
                    </Tooltip>
                </Group>
            </Container>
        </header>
    );
}